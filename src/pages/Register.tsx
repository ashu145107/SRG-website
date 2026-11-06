/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useRegisterMutation, useCompanyRegisterMutation } from '../services/authApi';
import {
  useGetCountriesQuery,
  useGetStatesQuery,
  useGetDistrictsQuery,
  useGetTalukasQuery,
  useGetSevaKendrasQuery,
  useGetEducationsListQuery,
  useGetSubEducationsListQuery,
  getLocalizedName
} from '../services/masterApi';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert, Toast } from '../components/ui/FeedbackComponents';
import { LanguageSwitcher } from '../components/ui/UtilityComponents';
import { Navbar } from '../components/Navbar';
import { UserRole } from '../types';
import { ArrowLeft, User, Phone, Mail, Award, CheckCircle2, MapPin, Building, Globe, Layers } from 'lucide-react';

/** Inline per-field validation message rendered under an input (REG-017). */
const FieldError: React.FC<{ show?: boolean; message?: string }> = ({ show, message }) =>
  show && message ? (
    <p className="text-[11px] text-red-600 font-semibold mt-1 text-left" role="alert">
      {message}
    </p>
  ) : null;

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Primary Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [gender, setGender] = useState('M'); // Male by default ('M' vs 'F')
  const [experience, setExperience] = useState('');
  const [isTnCChecked, setIsTnCChecked] = useState(false);
  const [isOpenEula, setIsOpenEula] = useState(false);

  // Cascading Selection Lists from live srgapp Swagger APIs
  const [countryId, setCountryId] = useState<number>(1); // Default to India (1)
  const [stateId, setStateId] = useState<number>(1); // Default to Maharashtra (1)
  const [districtId, setDistrictId] = useState<number>(0);
  const [talukaId, setTalukaId] = useState<number>(0);
  const [sevaKendraId, setSevaKendraId] = useState<number>(0);
  const [educationId, setEducationId] = useState<number>(0);
  const [subEducationId, setSubEducationId] = useState<number>(0);

  // Query Hooks
  const { data: countries = [], isLoading: isLoadingCountries } = useGetCountriesQuery();
  const { data: states = [], isLoading: isLoadingStates } = useGetStatesQuery(countryId, { skip: !countryId });
  const { data: districts = [], isLoading: isLoadingDistricts } = useGetDistrictsQuery(stateId, { skip: !stateId });
  const { data: talukas = [], isLoading: isLoadingTalukas } = useGetTalukasQuery(districtId, { skip: !districtId });
  const { data: sevaKendras = [], isLoading: isLoadingSevaKendras } = useGetSevaKendrasQuery(talukaId, { skip: !talukaId });
  const { data: educations = [], isLoading: isLoadingEducations } = useGetEducationsListQuery();
  const { data: subEducations = [], isLoading: isLoadingSubEducations } = useGetSubEducationsListQuery(educationId, { skip: !educationId });

  // Errors and System States
  const [errorText, setErrorText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Extract initial role selection from URL
  const initialRole = searchParams.get('role');

  // Registration Type Selector
  const [registrationType, setRegistrationType] = useState<'job_seeker' | 'employer'>(
    initialRole === 'employer' ? 'employer' : 'job_seeker'
  );

  // Employer Registration Form States
  const [empFullName, setEmpFullName] = useState('');
  const [empMobile, setEmpMobile] = useState('');
  const [empAddress, setEmpAddress] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empContactPerson, setEmpContactPerson] = useState('');
  const [empAlternateContactPerson, setEmpAlternateContactPerson] = useState('');
  const [empAlternateContactNumber, setEmpAlternateContactNumber] = useState('');
  const [empCompanyTypeId, setEmpCompanyTypeId] = useState<number>(1);
  const [empIndustryTypeId, setEmpIndustryTypeId] = useState<number>(1);
  const [empDescription, setEmpDescription] = useState('');
  const [empWebsite, setEmpWebsite] = useState('');
  const [empAlternateEmail, setEmpAlternateEmail] = useState('');
  const [isRegisteredSuccess, setIsRegisteredSuccess] = useState(false);

  // Employer Location Selection States
  const [empStateId, setEmpStateId] = useState<number>(1); // Default to Maharashtra (1)
  const [empDistrictId, setEmpDistrictId] = useState<number>(0);
  const [empTalukaId, setEmpTalukaId] = useState<number>(0);

  // Cascading Location Selection Lists for Employer using live master APIs
  const { data: empDistricts = [], isLoading: isLoadingEmpDistricts } = useGetDistrictsQuery(empStateId, { skip: !empStateId });
  const { data: empTalukas = [], isLoading: isLoadingEmpTalukas } = useGetTalukasQuery(empDistrictId, { skip: !empDistrictId });

  // Register mutations
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [companyRegister, { isLoading: isCompanyRegistering }] = useCompanyRegisterMutation();

  // Highlight input textboxes/select fields in red if validation fails
  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  // Inline per-field error messages rendered directly under the affected input (REG-017)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fieldLabels: Record<string, string> = {
    name: 'Full name',
    phone: 'Mobile number',
    email: 'Email',
    countryId: 'Country',
    stateId: 'State',
    districtId: 'District',
    talukaId: 'Taluka',
    educationId: 'Education',
    subEducationId: 'Sub-education',
    experience: 'Experience',
    isTnCChecked: 'Terms and conditions',
    empFullName: 'Company name',
    empMobile: 'Mobile number',
    empAddress: 'Address',
    empEmail: 'Email',
    empStateId: 'State',
    empDistrictId: 'District',
    empTalukaId: 'Taluka',
    empContactPerson: 'Contact person',
    empAlternateContactNumber: 'Alternate contact number',
    empCompanyTypeId: 'Company type',
    empIndustryTypeId: 'Industry type',
    empDescription: 'Company description',
    empAlternateEmail: 'Alternate email',
  };

  const clearError = (fieldName: string) => {
    if (invalidFields[fieldName]) {
      setInvalidFields((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Keep validation feedback near the submit controls and focus that summary.
  const focusOnErrors = () => {
    setTimeout(() => {
      const banner = document.querySelector<HTMLElement>('[data-error-summary], [data-error-banner]');
      if (banner) {
        banner.focus({ preventScroll: true });
        banner.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  // Clear all invalid fields when changing registration type
  useEffect(() => {
    setInvalidFields({});
    setFieldErrors({});
    setErrorText('');
  }, [registrationType]);

  // If redirected from gateway clicks, prefill preferred role
  useEffect(() => {
    if (location.state?.preferredRole) {
      setRole(location.state.preferredRole as UserRole);
    }
  }, [location.state]);

  // Set default state when countries / states are loaded
  useEffect(() => {
    if (countries.length > 0 && !countryId) {
      setCountryId(1); // Set to INDIA automatically
    }
  }, [countries]);

  useEffect(() => {
    if (states.length > 0 && !stateId && countryId === 1) {
      setStateId(1); // Set to Maharashtra automatically for local convenience
    }
  }, [states, countryId]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    // Form Validations as requested:
    // Country, State, District, Mobile number, Name, Taluka, Sevakendra, Education, Subeducation, Experience are all mandatory.
    const newInvalids: Record<string, boolean> = {};

    if (!name.trim()) {
      newInvalids['name'] = true;
    }

    if (!phone.trim()) {
      newInvalids['phone'] = true;
    } else if (!/^\d+$/.test(phone.trim()) || phone.trim().length < 10 || phone.trim().length > 15) {
      newInvalids['phone'] = true;
    }

    if (email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim().toLowerCase())) {
        newInvalids['email'] = true;
      }
    }

    if (!countryId) {
      newInvalids['countryId'] = true;
    }

    if (!stateId) {
      newInvalids['stateId'] = true;
    }

    if (!districtId) {
      newInvalids['districtId'] = true;
    }

    if (!talukaId) {
      newInvalids['talukaId'] = true;
    }

    if (!educationId) {
      newInvalids['educationId'] = true;
    }

    if (!subEducationId) {
      newInvalids['subEducationId'] = true;
    }

    if (experience.trim() === '' || isNaN(Number(experience)) || Number(experience) < 0) {
      newInvalids['experience'] = true;
    }

    if (!isTnCChecked) {
      newInvalids['isTnCChecked'] = true;
    }

    if (Object.keys(newInvalids).length > 0) {
      setInvalidFields(newInvalids);

      const errs: Record<string, string> = {};
      if (newInvalids['name']) {
        errs['name'] = t('reg.error.fullNameRequired');
      }
      if (newInvalids['phone']) {
        errs['phone'] = phone.trim() ? t('reg.error.mobileInvalid') : t('reg.error.mobileRequired');
      }
      if (newInvalids['email']) {
        errs['email'] = t('reg.error.emailInvalid');
      }
      if (newInvalids['countryId']) {
        errs['countryId'] = t('reg.error.countryRequired');
      }
      if (newInvalids['stateId']) {
        errs['stateId'] = t('reg.error.stateRequired');
      }
      if (newInvalids['districtId']) {
        errs['districtId'] = t('reg.error.districtRequired');
      }
      if (newInvalids['talukaId']) {
        errs['talukaId'] = t('reg.error.talukaRequired');
      }
      if (newInvalids['educationId']) {
        errs['educationId'] = t('reg.error.educationRequired');
      }
      if (newInvalids['subEducationId']) {
        errs['subEducationId'] = t('reg.error.subEducationRequired');
      }
      if (newInvalids['experience']) {
        errs['experience'] = experience.trim() === '' ? t('reg.error.experienceRequired') : t('reg.error.experienceInvalid');
      }
      if (newInvalids['isTnCChecked']) {
        errs['isTnCChecked'] = t('reg.error.termsRequired');
      }
      setFieldErrors(errs);
      const firstKey = Object.keys(errs)[0];
      setErrorText(firstKey ? errs[firstKey] : t('reg.error.correctFields'));
      focusOnErrors();
      return;
    }

    setInvalidFields({});
    setFieldErrors({});

    // Find Names for friendly profile summary storage
    const selectedCountry = countries.find(c => c.id === countryId)?.name || '';
    const selectedState = getLocalizedName(states.find(s => s.id === stateId));
    const selectedDistrict = getLocalizedName(districts.find(d => d.id === districtId));
    const selectedTaluka = getLocalizedName(talukas.find(t => t.id === talukaId));
    const selectedSevaKendra = 'dindori';
    const selectedEducation = educations.find(e => e.id === educationId)?.name || '';
    const selectedSubEdu = subEducations.find(se => se.id === subEducationId)?.name || '';

    try {
      const response = await register({
        name: name.trim(),
        email: email.trim() ? email.trim() : '',
        phone: phone.trim(),
        role,
        countryName: selectedCountry,
        stateName: selectedState,
        districtName: selectedDistrict,
        talukaName: selectedTaluka,
        sevaKendraName: selectedSevaKendra,
        educationName: selectedEducation,
        subEducationName: selectedSubEdu,
        gender,
        experience: experience.trim(),
        countryId,
        stateId,
        districtId,
        talukaId,
        sevaKendraId,
        educationId,
        subEducationId
      }).unwrap();

      setIsRegisteredSuccess(true);
      setToastMessage(t('reg.toast.accountRegistered'));
    } catch (err: any) {
      setErrorText(err.data || t('reg.error.registrationFailed'));
      focusOnErrors();
    }
  };

  const handleEmployerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const newInvalids: Record<string, boolean> = {};

    if (!empFullName.trim()) {
      newInvalids['empFullName'] = true;
    }

    const mobilePattern = /^\d{10}$/;
    if (!empMobile.trim()) {
      newInvalids['empMobile'] = true;
    } else if (!mobilePattern.test(empMobile.trim())) {
      newInvalids['empMobile'] = true;
    }

    if (!empAddress.trim()) {
      newInvalids['empAddress'] = true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!empEmail.trim()) {
      newInvalids['empEmail'] = true;
    } else if (!emailPattern.test(empEmail.trim().toLowerCase())) {
      newInvalids['empEmail'] = true;
    }

    if (!empStateId) {
      newInvalids['empStateId'] = true;
    }

    if (!empDistrictId) {
      newInvalids['empDistrictId'] = true;
    }

    if (!empTalukaId) {
      newInvalids['empTalukaId'] = true;
    }

    if (!empContactPerson.trim()) {
      newInvalids['empContactPerson'] = true;
    }

    // Alternate contact person, alternate mobile, website and alternate email
    // are optional (REG-013) — only validate format when a value is supplied.
    if (empAlternateContactNumber.trim() && !mobilePattern.test(empAlternateContactNumber.trim())) {
      newInvalids['empAlternateContactNumber'] = true;
    }

    if (!empCompanyTypeId) {
      newInvalids['empCompanyTypeId'] = true;
    }

    if (!empIndustryTypeId) {
      newInvalids['empIndustryTypeId'] = true;
    }

    if (!empDescription.trim()) {
      newInvalids['empDescription'] = true;
    }

    if (empAlternateEmail.trim() && !emailPattern.test(empAlternateEmail.trim().toLowerCase())) {
      newInvalids['empAlternateEmail'] = true;
    }

    if (!isTnCChecked) {
      newInvalids['isTnCChecked'] = true;
    }

    if (Object.keys(newInvalids).length > 0) {
      setInvalidFields(newInvalids);

      const errs: Record<string, string> = {};
      if (newInvalids['empFullName']) {
        errs['empFullName'] = t('reg.error.companyNameRequired');
      }
      if (newInvalids['empMobile']) {
        errs['empMobile'] = empMobile.trim() ? t('reg.error.empMobileInvalid') : t('reg.error.empMobileRequired');
      }
      if (newInvalids['empAddress']) {
        errs['empAddress'] = t('reg.error.addressRequired');
      }
      if (newInvalids['empEmail']) {
        errs['empEmail'] = empEmail.trim() ? t('reg.error.empEmailInvalid') : t('reg.error.emailRequired');
      }
      if (newInvalids['empStateId']) {
        errs['empStateId'] = t('reg.error.empStateRequired');
      }
      if (newInvalids['empDistrictId']) {
        errs['empDistrictId'] = t('reg.error.empDistrictRequired');
      }
      if (newInvalids['empTalukaId']) {
        errs['empTalukaId'] = t('reg.error.empTalukaRequired');
      }
      if (newInvalids['empContactPerson']) {
        errs['empContactPerson'] = t('reg.error.contactPersonRequired');
      }
      if (newInvalids['empAlternateContactNumber']) {
        errs['empAlternateContactNumber'] = t('reg.error.altContactNumberInvalid');
      }
      if (newInvalids['empCompanyTypeId']) {
        errs['empCompanyTypeId'] = t('reg.error.companyTypeRequired');
      }
      if (newInvalids['empIndustryTypeId']) {
        errs['empIndustryTypeId'] = t('reg.error.industryTypeRequired');
      }
      if (newInvalids['empDescription']) {
        errs['empDescription'] = t('reg.error.descriptionRequired');
      }
      if (newInvalids['empAlternateEmail']) {
        errs['empAlternateEmail'] = t('reg.error.altEmailInvalid');
      }
      if (newInvalids['isTnCChecked']) {
        errs['isTnCChecked'] = t('reg.error.termsRequired');
      }
      setFieldErrors(errs);
      const firstKey = Object.keys(errs)[0];
      setErrorText(firstKey ? errs[firstKey] : t('reg.error.correctFields'));
      focusOnErrors();
      return;
    }

    setInvalidFields({});
    setFieldErrors({});

    try {
      const response = await companyRegister({
        fullname: empFullName.trim(),
        mobile: empMobile.trim(),
        address: empAddress.trim(),
        email: empEmail.trim().toLowerCase(),
        talukaId: Number(empTalukaId),
        districtId: Number(empDistrictId),
        stateId: Number(empStateId),
        contactPerson: empContactPerson.trim(),
        alternateContactPerson: empAlternateContactPerson.trim(),
        alternateContactNumber: empAlternateContactNumber.trim(),
        companyTypeId: Number(empCompanyTypeId),
        industryTypeId: Number(empIndustryTypeId),
        discription: empDescription.trim(),
        website: empWebsite.trim(),
        alternateEmail: empAlternateEmail.trim().toLowerCase()
      }).unwrap();

      setIsRegisteredSuccess(true);
      setToastMessage(t('reg.toast.employerRegistered'));
    } catch (err: any) {
      const serverErr = typeof err?.data === 'string' ? err.data : (err?.data?.error?.message || err?.message);
      setErrorText(serverErr || t('reg.error.registrationFailedCheckDetails'));
      focusOnErrors();
    }
  };

  const roleOptions = [
    { value: UserRole.CANDIDATE, label: t('reg.option.candidate') },
    { value: UserRole.COMPANY, label: t('reg.option.recruiter') },
    { value: UserRole.SHG, label: t('reg.option.shg') }
  ];

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col antialiased font-sans">
      {/* Top Unified Navbar */}
      <Navbar activePage="register" compact />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-4 pt-4 pb-8 sm:pt-5 sm:pb-12">
        <div className="m-auto w-full max-w-lg md:max-w-3xl lg:max-w-5xl text-center space-y-3 mb-6">
          {/* Brand Seal */}
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-md border border-theme-lightViolet flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform">
            <img src="/home/logo.png" alt="SRG Logo" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-theme-darkViolet tracking-tight">
            {t('reg.heading.registerNewAccount')}
          </h1>

          <p className="text-xs text-theme-lavender font-extrabold uppercase tracking-wider bg-theme-lightViolet/60 inline-block px-4 py-1.5 rounded-full border border-theme-lightViolet">
            {t('reg.brand.tagline')}
          </p>
        </div>

        <div className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-md py-6 sm:py-8 px-5 sm:px-10 rounded-3xl border border-theme-lightViolet/80 shadow-2xl space-y-6">

            {isRegisteredSuccess ? (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="bg-theme-lightViolet/40 border border-theme-lightViolet p-4 rounded-full mb-5">
                  <CheckCircle2 className="h-14 w-14 text-theme-deepTeal" />
                </div>

                <h3 className="text-xl font-bold text-theme-darkViolet mb-3">
                  {t('reg.heading.registrationSuccessful')}
                </h3>

                <div className="bg-theme-cream/80 border border-theme-lightViolet/80 rounded-2xl p-5 text-left mb-6 max-w-xl w-full">
                  <p className="text-sm text-theme-darkViolet font-bold leading-normal mb-1">
                    {t('reg.success.verificationSent')}
                  </p>
                  <div className="h-px bg-theme-lightViolet/60 my-3" />
                  <p className="text-sm text-slate-700 leading-normal">
                    {t('reg.success.emailPrefix')}<span className="font-semibold text-theme-darkViolet">{registrationType === 'employer' ? empEmail : email}</span>{t('reg.success.emailSuffix')}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md">
                  <Link
                    to="/login"
                    className="btn-gloss flex-1 inline-flex items-center justify-center gap-2 bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-98"
                  >
                    {t('reg.btn.goToLogin')}
                  </Link>
                  <Link
                    to="/"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-theme-lightViolet/80 hover:bg-theme-lightViolet/30 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition-all active:scale-98"
                  >
                    {t('reg.btn.home')}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Separate Form Tab Switcher */}
                <div className="flex border border-theme-lightViolet/80 p-1.5 bg-theme-lightViolet/30 rounded-2xl max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('job_seeker');
                      setErrorText('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${registrationType === 'job_seeker'
                        ? 'bg-white text-theme-lavender shadow-md border border-theme-lightViolet/60 font-black'
                        : 'text-slate-600 hover:text-theme-darkViolet'
                      }`}
                  >
                    <User className="w-4 h-4" />
                    <div className="flex flex-col text-left">
                      <span className="leading-tight text-[11px] block font-extrabold">{t('reg.tab.jobSeeker')}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationType('employer');
                      setErrorText('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${registrationType === 'employer'
                        ? 'bg-white text-theme-lavender shadow-md border border-theme-lightViolet/60 font-black'
                        : 'text-slate-600 hover:text-theme-darkViolet'
                      }`}
                  >
                    <Building className="w-4 h-4" />
                    <div className="flex flex-col text-left">
                      <span className="leading-tight text-[11px] block font-extrabold">{t('reg.tab.employer')}</span>
                    </div>
                  </button>
                </div>

              {registrationType === 'employer' ? (
                <form className="space-y-6" onSubmit={handleEmployerSubmit}>
                  {/* Step Title */}
                  <div className="border-b border-theme-lightViolet/60 pb-3 text-left">
                    <h3 className="text-xs sm:text-sm font-black text-theme-darkViolet uppercase tracking-wide flex items-center gap-2">
                      <Building className="w-4 h-4 text-theme-lavender" />
                      <span>{t('reg.heading.employerRegistrationDetails')}</span>
                    </h3>
                  </div>

                  {/* Row 1: Company Name */}
                  <div className="text-left">
                    <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-theme-lavender" />
                      <span>{t('reg.form.companyFullName')}</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t('reg.form.companyFullNamePlaceholder')}
                      className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empFullName']
                          ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                          : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                        }`}
                      value={empFullName}
                      onChange={(e) => {
                        setEmpFullName(e.target.value);
                        clearError('empFullName');
                      }}
                      maxLength={150}
                    />
                    <FieldError message={fieldErrors['empFullName']} />
                  </div>

                  {/* Row 2: Address & Main Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>{t('reg.form.address')}</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder={t('reg.form.addressPlaceholder')}
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium resize-y ${invalidFields['empAddress']
                            ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                            : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                          }`}
                        value={empAddress}
                        onChange={(e) => {
                          setEmpAddress(e.target.value);
                          clearError('empAddress');
                        }}
                        maxLength={200}
                      />
                      <FieldError message={fieldErrors['empAddress']} />
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>{t('reg.form.mainEmail')}</span>
                      </label>
                      <input
                        type="email"
                        placeholder={t('reg.form.mainEmailPlaceholder')}
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empEmail']
                            ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                            : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                          }`}
                        value={empEmail}
                        onChange={(e) => {
                          setEmpEmail(e.target.value);
                          clearError('empEmail');
                        }}
                        maxLength={100}
                      />
                      <FieldError message={fieldErrors['empEmail']} />
                    </div>
                  </div>

                  {/* Location Details Cascading Selections */}
                  <div className="bg-theme-cream/80 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                      <MapPin className="w-4 h-4 text-theme-lavender" />
                      <span>{t('reg.heading.locationDetailsRequired')}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('reg.form.empState')}</label>
                        <select
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['empStateId']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empStateId}
                          onChange={(e) => {
                            setEmpStateId(Number(e.target.value));
                            setEmpDistrictId(0);
                            setEmpTalukaId(0);
                            clearError('empStateId');
                          }}
                          disabled={isLoadingStates}
                        >
                          <option value="0">{t('reg.option.state')}</option>
                          {states.map(s => (
                            <option key={s.id} value={s.id}>{getLocalizedName(s)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {t('reg.form.empDistrict')} {isLoadingEmpDistricts && <span className="text-[9px] text-theme-lavender">(...)</span>}
                        </label>
                        <select
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['empDistrictId']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empDistrictId}
                          onChange={(e) => {
                            setEmpDistrictId(Number(e.target.value));
                            setEmpTalukaId(0);
                            clearError('empDistrictId');
                          }}
                          disabled={!empStateId || isLoadingEmpDistricts}
                        >
                          <option value="0">{t('reg.option.selectDistrict')}</option>
                          {empDistricts.map(d => (
                            <option key={d.id} value={d.id}>{getLocalizedName(d)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {t('reg.form.empTaluka')} {isLoadingEmpTalukas && <span className="text-[9px] text-theme-lavender">(...)</span>}
                        </label>
                        <select
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['empTalukaId']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empTalukaId}
                          onChange={(e) => {
                            setEmpTalukaId(Number(e.target.value));
                            clearError('empTalukaId');
                          }}
                          disabled={!empDistrictId || isLoadingEmpTalukas}
                        >
                          <option value="0">{t('reg.option.selectTaluka')}</option>
                          {empTalukas.map(t => (
                            <option key={t.id} value={t.id}>{getLocalizedName(t)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Person Details */}
                  <div className="bg-theme-lightViolet/20 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                      <User className="w-4 h-4 text-theme-lavender" />
                      <span>{t('reg.heading.contactPersonDetails')}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('reg.form.empContactPerson')}</label>
                        <input
                          type="text"
                          placeholder={t('reg.form.contactPersonPlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empContactPerson']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empContactPerson}
                          onChange={(e) => {
                            setEmpContactPerson(e.target.value);
                            clearError('empContactPerson');
                          }}
                          maxLength={100}
                        />
                        <FieldError message={fieldErrors['empContactPerson']} />
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('reg.form.contactMobile')}</label>
                        <input
                          type="tel"
                          placeholder={t('reg.form.contactMobilePlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empMobile']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empMobile}
                          onChange={(e) => {
                            setEmpMobile(e.target.value);
                            clearError('empMobile');
                          }}
                          maxLength={10}
                        />
                        <FieldError message={fieldErrors['empMobile']} />
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('reg.form.empAltContactPerson')}</label>
                        <input
                          type="text"
                          placeholder={t('reg.form.altContactPersonPlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empAlternateContactPerson']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empAlternateContactPerson}
                          onChange={(e) => {
                            setEmpAlternateContactPerson(e.target.value);
                            clearError('empAlternateContactPerson');
                          }}
                          maxLength={100}
                        />
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('reg.form.empAltMobile')}</label>
                        <input
                          type="tel"
                          placeholder={t('reg.form.altMobilePlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empAlternateContactNumber']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={empAlternateContactNumber}
                          onChange={(e) => {
                            setEmpAlternateContactNumber(e.target.value);
                            clearError('empAlternateContactNumber');
                          }}
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Company Type & Industry Type Dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>{t('reg.form.companyType')}</span>
                      </label>
                      <select
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-bold ${invalidFields['empCompanyTypeId']
                            ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                            : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                          }`}
                        value={empCompanyTypeId}
                        onChange={(e) => {
                          setEmpCompanyTypeId(Number(e.target.value));
                          clearError('empCompanyTypeId');
                        }}
                      >
                        <option value="1">{t('reg.option.privateLimited')}</option>
                        <option value="2">{t('reg.option.partnership')}</option>
                        <option value="3">{t('reg.option.proprietorship')}</option>
                        <option value="4">{t('reg.option.publicLimited')}</option>
                        <option value="5">{t('reg.option.cooperative')}</option>
                        <option value="6">{t('reg.option.other')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>{t('reg.form.industryType')}</span>
                      </label>
                      <select
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-bold ${invalidFields['empIndustryTypeId']
                            ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                            : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                          }`}
                        value={empIndustryTypeId}
                        onChange={(e) => {
                          setEmpIndustryTypeId(Number(e.target.value));
                          clearError('empIndustryTypeId');
                        }}
                      >
                        <option value="1">{t('reg.option.informationTechnology')}</option>
                        <option value="2">{t('reg.option.manufacturingEngineering')}</option>
                        <option value="3">{t('reg.option.retailSales')}</option>
                        <option value="4">{t('reg.option.educationTraining')}</option>
                        <option value="5">{t('reg.option.healthcare')}</option>
                        <option value="6">{t('reg.option.constructionInfrastructure')}</option>
                        <option value="7">{t('reg.option.other')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Website & Alternate Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>{t('reg.form.companyWebsite')}</span>
                      </label>
                      <input
                        type="text"
                        placeholder={t('reg.form.websitePlaceholder')}
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empWebsite']
                            ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                            : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                          }`}
                        value={empWebsite}
                        onChange={(e) => {
                          setEmpWebsite(e.target.value);
                          clearError('empWebsite');
                        }}
                        maxLength={100}
                      />
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>{t('reg.form.alternateEmail')}</span>
                      </label>
                      <input
                        type="email"
                        placeholder={t('reg.form.altEmailPlaceholder')}
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empAlternateEmail']
                            ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                            : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                          }`}
                        value={empAlternateEmail}
                        onChange={(e) => {
                          setEmpAlternateEmail(e.target.value);
                          clearError('empAlternateEmail');
                        }}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  {/* Company Description */}
                  <div className="text-left">
                    <label className="block text-xs font-bold text-theme-darkViolet mb-1.5">
                      {t('reg.form.companyDescription')}
                    </label>
                    <textarea
                      placeholder={t('reg.form.companyDescriptionPlaceholder')}
                      rows={3}
                      className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empDescription']
                          ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                          : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                        }`}
                      value={empDescription}
                      onChange={(e) => {
                        setEmpDescription(e.target.value);
                        clearError('empDescription');
                      }}
                      maxLength={500}
                    />
                  </div>

                  {/* Terms and Conditions Checkbox with EULA Link */}
                  <div className="flex items-start gap-2.5 text-left pt-2 border-t border-theme-lightViolet/60">
                    <input
                      id="IsTnCCheckedEmp"
                      type="checkbox"
                      checked={isTnCChecked}
                      onChange={(e) => {
                        setIsTnCChecked(e.target.checked);
                        if (e.target.checked) clearError('isTnCChecked');
                      }}
                      className={`mt-1 accent-theme-lavender w-4 h-4 cursor-pointer rounded-sm ${invalidFields['isTnCChecked'] ? 'outline-2 outline-offset-2 outline-red-500 ring-2 ring-red-400' : ''
                        }`}
                    />
                    <label htmlFor="IsTnCCheckedEmp" className="text-xs font-semibold text-slate-700 leading-snug select-none">
                      {t('reg.tc.agreePrefix')}{' '}
                      <button
                        type="button"
                        onClick={() => setIsOpenEula(true)}
                        className="text-theme-lavender font-bold hover:underline inline focus:outline-none cursor-pointer"
                      >
                        {t('reg.tc.link')}
                      </button>{' '}
                      <Link to="/legal/terms-candidate" target="_blank" rel="noopener noreferrer" className="text-theme-lavender font-bold hover:underline">
                        ({t('legal.docLinks.candidateTerms')})
                      </Link>{' '}
                      & <Link to="/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-theme-lavender font-bold hover:underline">
                        {t('footer.privacy')}
                      </Link>
                      {t('reg.tc.agreeSuffix')}
                    </label>
                  </div>

                  {errorText && (
                    <div tabIndex={-1} data-error-summary className="space-y-2 outline-none">
                      <Alert type="danger" message={errorText} />
                      {Object.entries(fieldErrors).map(([field, message]) => (
                        <p key={field} className="text-xs font-semibold text-red-700">
                          <span className="font-bold">{fieldLabels[field] || field}:</span> {message}
                        </p>
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCompanyRegistering}
                    className="btn-gloss w-full py-3.5 px-6 rounded-xl bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCompanyRegistering ? t('reg.btn.submitting') : t('reg.btn.submitEmployer')}
                  </button>

                </form>
              ) : (
                <>
                  <div className="border-b border-theme-lightViolet/60 pb-3 text-left">
                    <h3 className="text-xs sm:text-sm font-black text-theme-darkViolet uppercase tracking-wide flex items-center gap-2">
                      <User className="w-4 h-4 text-theme-lavender" />
                      <span>{t('reg.heading.step1')}</span>
                    </h3>
                  </div>

                  <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                    {/* Grid 1: Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-theme-lavender" />
                          <span>{t('reg.form.fullName')}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={t('reg.form.fullNamePlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['name']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearError('name');
                          }}
                          maxLength={100}
                        />
                        <FieldError message={fieldErrors['name']} />
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-theme-lavender" />
                          <span>{t('reg.form.mobileNumber')}</span>
                        </label>
                        <input
                          type="tel"
                          placeholder={t('reg.form.mobilePlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['phone']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            clearError('phone');
                          }}
                          maxLength={15}
                        />
                        <FieldError message={fieldErrors['phone']} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-theme-lavender" />
                          <span>{t('reg.form.emailOptional')}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={t('reg.form.emailPlaceholder')}
                          className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['email']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                            }`}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError('email');
                          }}
                          maxLength={100}
                        />
                        <FieldError message={fieldErrors['email']} />
                        <p className="text-[10px] text-slate-500 mt-1">{t('reg.form.emailOptionalHelper')}</p>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5">
                          {t('reg.form.gender')}
                        </label>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {(
                            [
                              { value: 'M', labelKey: 'reg.option.male' },
                              { value: 'F', labelKey: 'reg.option.female' },
                              { value: 'O', labelKey: 'reg.option.otherGender' },
                              { value: 'N', labelKey: 'reg.option.preferNotToSay' },
                            ] as const
                          ).map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-white hover:bg-theme-lightViolet/30 px-3 py-2.5 rounded-xl border border-theme-lightViolet/80 transition-colors"
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={opt.value}
                                checked={gender === opt.value}
                                onChange={() => setGender(opt.value)}
                                className="accent-theme-lavender scale-110"
                              />
                              <span className="truncate">{t(opt.labelKey)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Grid 2: Custom Live API Cascading Selections of Location */}
                    <div className="bg-theme-cream/80 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                      <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                        <MapPin className="w-4 h-4 text-theme-lavender" />
                        <span>{t('reg.heading.locationDetails')}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">{t('reg.form.country')}</label>
                          <select
                            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['countryId']
                                ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                                : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                              }`}
                            value={countryId}
                            onChange={(e) => {
                              setCountryId(Number(e.target.value));
                              setStateId(0);
                              setDistrictId(0);
                              setTalukaId(0);
                              setSevaKendraId(0);
                              clearError('countryId');
                            }}
                            disabled={isLoadingCountries}
                          >
                            <option value="0">{t('reg.option.selectCountry')}</option>
                            {countries.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {t('reg.form.state')} {isLoadingStates && <span className="text-[9px] text-theme-lavender">(Loading...)</span>}
                          </label>
                          <select
                            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['stateId']
                                ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                                : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                              }`}
                            value={stateId}
                            onChange={(e) => {
                              setStateId(Number(e.target.value));
                              setDistrictId(0);
                              setTalukaId(0);
                              setSevaKendraId(0);
                              clearError('stateId');
                            }}
                            disabled={!countryId || isLoadingStates}
                          >
                            <option value="0">{t('reg.option.selectState')}</option>
                            {states.map(s => (
                              <option key={s.id} value={s.id}>{getLocalizedName(s)}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {t('reg.form.district')} {isLoadingDistricts && <span className="text-[9px] text-theme-lavender">(...)</span>}
                          </label>
                          <select
                            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['districtId']
                                ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                                : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                              }`}
                            value={districtId}
                            onChange={(e) => {
                              setDistrictId(Number(e.target.value));
                              setTalukaId(0);
                              clearError('districtId');
                            }}
                            disabled={!stateId || isLoadingDistricts}
                          >
                          <option value="0">{t('reg.option.selectDistrict')}</option>
                            {districts.map(d => (
                              <option key={d.id} value={d.id}>{getLocalizedName(d)}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {t('reg.form.taluka')} {isLoadingTalukas && <span className="text-[9px] text-theme-lavender">(...)</span>}
                          </label>
                          <select
                            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['talukaId']
                                ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                                : 'border-theme-lightViolet/80 focus:border-theme-lavender focus:ring-theme-lavender/20'
                              }`}
                            value={talukaId}
                            onChange={(e) => {
                              setTalukaId(Number(e.target.value));
                              clearError('talukaId');
                            }}
                            disabled={!districtId || isLoadingTalukas}
                          >
                          <option value="0">{t('reg.option.selectTaluka')}</option>
                            {talukas.map(t => (
                              <option key={t.id} value={t.id}>{getLocalizedName(t)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Grid 3: Education Detail Cascader and Experience */}
                    <div className="bg-theme-lightViolet/20 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                      <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                        <Award className="w-4 h-4 text-theme-deepTeal" />
                        <span>{t('reg.heading.educationExperience')}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {t('reg.form.education')} {isLoadingEducations && <span className="text-[9px] text-theme-deepTeal">(...)</span>}
                          </label>
                          <select
                            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['educationId']
                                ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                                : 'border-theme-lightViolet/80 focus:border-theme-deepTeal focus:ring-theme-deepTeal/20'
                              }`}
                            value={educationId}
                            onChange={(e) => {
                              setEducationId(Number(e.target.value));
                              setSubEducationId(0);
                              clearError('educationId');
                            }}
                            disabled={isLoadingEducations}
                          >
                            <option value="0">{t('reg.option.selectEducation')}</option>
                            {educations.map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            {t('reg.form.specialization')} {isLoadingSubEducations && <span className="text-[9px] text-theme-deepTeal">(...)</span>}
                          </label>
                          <select
                            className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all disabled:opacity-60 text-slate-800 font-bold ${invalidFields['subEducationId']
                                ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                                : 'border-theme-lightViolet/80 focus:border-theme-deepTeal focus:ring-theme-deepTeal/20'
                              }`}
                            value={subEducationId}
                            onChange={(e) => {
                              setSubEducationId(Number(e.target.value));
                              clearError('subEducationId');
                            }}
                            disabled={!educationId || isLoadingSubEducations}
                          >
                            <option value="0">{t('reg.option.selectSpecialization')}</option>
                            {subEducations.map(se => (
                              <option key={se.id} value={se.id}>{se.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5">
                          {t('reg.form.experience')}
                        </label>
                        <input
                          type="number"
                          placeholder={t('reg.form.experiencePlaceholder')}
                          min="0"
                          max="60"
                          className={`w-full sm:w-1/2 text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-bold ${invalidFields['experience']
                              ? 'border-red-500 focus:ring-red-200 ring-2 ring-red-105'
                              : 'border-theme-lightViolet/80 focus:border-theme-deepTeal focus:ring-theme-deepTeal/20'
                            }`}
                          value={experience}
                          onChange={(e) => {
                            setExperience(e.target.value);
                            clearError('experience');
                          }}
                        />
                        <p className="text-[10px] text-slate-500 mt-1">{t('reg.form.experienceFresherHelper')}</p>
                      </div>
                    </div>

                    {/* Terms and Conditions Checkbox with EULA Link */}
                    <div className="flex items-start gap-2.5 text-left pt-2 border-t border-theme-lightViolet/60">
                      <input
                        id="IsTnCChecked"
                        type="checkbox"
                        checked={isTnCChecked}
                        onChange={(e) => {
                          setIsTnCChecked(e.target.checked);
                          if (e.target.checked) clearError('isTnCChecked');
                        }}
                        className={`mt-1 accent-theme-lavender w-4 h-4 cursor-pointer rounded-sm ${invalidFields['isTnCChecked'] ? 'outline-2 outline-offset-2 outline-red-500 ring-2 ring-red-400' : ''
                          }`}
                      />
                      <label htmlFor="IsTnCChecked" className="text-xs font-semibold text-slate-700 leading-snug select-none">
                        {t('reg.tc.agreePrefix')}{' '}
                        <button
                          type="button"
                          onClick={() => setIsOpenEula(true)}
                          className="text-theme-lavender font-bold hover:underline inline focus:outline-none cursor-pointer"
                        >
                          {t('reg.tc.link')}
                        </button>
                        {t('reg.tc.agreeSuffix')}
                      </label>
                    </div>

                    {errorText && (
                      <div tabIndex={-1} data-error-summary className="space-y-2 outline-none">
                        <Alert type="danger" message={errorText} />
                        {Object.entries(fieldErrors).map(([field, message]) => (
                          <p key={field} className="text-xs font-semibold text-red-700">
                            <span className="font-bold">{fieldLabels[field] || field}:</span> {message}
                          </p>
                        ))}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="btn-gloss w-full py-3.5 px-6 rounded-xl bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isRegistering ? t('reg.btn.submitting') : t('reg.btn.submitRegistration')}
                    </button>

                  </form>
                </>
              )}
            </>
          )}

          {!isRegisteredSuccess && (
            <div className="text-center text-xs font-semibold text-slate-500 border-t border-theme-lightViolet/60 pt-4 cursor-pointer">
              <Link to="/login" className="text-theme-lavender hover:underline font-bold">
                {t('reg.haveAccount')}
              </Link>
            </div>
          )}
        </div>
      </div>
      </main>

      {/* EULA Popup Modal */}
      {isOpenEula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-theme-lightViolet/80 flex flex-col max-h-[85vh] overflow-hidden">

            {/* Modal Header */}
            <div className="p-5 border-b border-theme-lightViolet/60 bg-linear-to-r from-theme-lightViolet/60 to-theme-cream flex justify-between items-center">
              <h3 className="font-bold text-theme-darkViolet text-sm sm:text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-theme-lavender animate-pulse"></span>
                {t('reg.heading.termsPrivacyNotice')}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpenEula(false)}
                className="text-gray-400 hover:text-slate-600 font-black text-lg p-1 transition-colors cursor-pointer"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-left text-xs text-slate-600 leading-relaxed max-h-[50vh]">
              <div className="p-4 bg-theme-lightViolet/30 border border-theme-lightViolet/60 rounded-xl space-y-3 font-medium">
                <p className="text-theme-darkViolet font-bold text-xs uppercase tracking-wider mb-1">
                  {t('reg.heading.privacyContentNotice')}
                </p>
                <p className="text-slate-700 italic font-bold">
                  "I further acknowledge that I have read and understand this Privacy Notice by checking the box.
                </p>
                <p className="text-slate-700 italic font-bold leading-normal">
                  I agree to the processing of my data in the outlined manner and consent to the Company using my personal information to communicate with me via email, telephone and SMS communications regarding my job application"
                </p>
              </div>

              <div className="border-t border-theme-lightViolet/50 pt-3 space-y-2">
                <p className="font-extrabold text-theme-darkViolet text-xs">
                  {t('reg.heading.marathiTranslation')}
                </p>
                <p className="text-slate-600">
                  {t('reg.consent.accuracy')}
                </p>
                <p className="text-slate-600 leading-normal">
                  {t('reg.consent.consent')}
                </p>
              </div>

              <div className="border-t border-theme-lightViolet/50 pt-3 space-y-2 text-[11px] text-slate-500">
                <h5 className="font-bold text-slate-700">{t('reg.heading.infoCollectionSecurity')}</h5>
                <p>
                  {t('reg.consent.privacy')}
                </p>
                <p>
                  All personal data including Contact information, Qualification details, and Placement history are governed by stringent confidentiality guidelines of Shree Swami Samarth Seva Marg recruitment portal.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-theme-cream/60 border-t border-theme-lightViolet/60 flex flex-col sm:flex-row gap-2 sm:items-center justify-end">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-theme-lavender sm:mr-auto">
                <Link to="/legal/privacy-policy" className="hover:underline">{t('footer.privacy')}</Link>
                <Link to="/legal/terms-candidate" className="hover:underline">{t('footer.termsOfUse')}</Link>
                <Link to="/legal/consent-forms" className="hover:underline">{t('legal.docLinks.consent')}</Link>
                <Link to="/legal/data-request" className="hover:underline">{t('legal.requestData')}</Link>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenEula(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-theme-lightViolet/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('reg.btn.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTnCChecked(true);
                  setIsOpenEula(false);
                }}
                className="btn-gloss px-5 py-2 bg-theme-lavender hover:bg-theme-lavender/90 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                {t('reg.btn.readAgree')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
