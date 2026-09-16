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
  useGetSubEducationsListQuery
} from '../services/masterApi';
import { PrimaryButton } from '../components/ui/Buttons';
import { Alert, Toast } from '../components/ui/FeedbackComponents';
import { LanguageSwitcher } from '../components/ui/UtilityComponents';
import { Navbar } from '../components/Navbar';
import { UserRole } from '../types';
import { ArrowLeft, User, Phone, Mail, Award, CheckCircle2, MapPin, Building, Globe, Layers } from 'lucide-react';

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

  const clearError = (fieldName: string) => {
    if (invalidFields[fieldName]) {
      setInvalidFields((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // Clear all invalid fields when changing registration type
  useEffect(() => {
    setInvalidFields({});
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

      if (newInvalids['name']) {
        setErrorText('कृपया आपले संपूर्ण नाव प्रविष्ट करा / Please enter your full name.');
      } else if (newInvalids['phone']) {
        if (!phone.trim()) {
          setErrorText('कृपया तुमचा मोबाईल नंबर प्रविष्ट करा / Please enter your mobile number.');
        } else {
          setErrorText('मोबाईल नंबर चुकीचा आहे (कृपया १० ते १५ अंकी वैध क्रमांक टाका). / Mobile number must be 10 to 15 numeric digits.');
        }
      } else if (newInvalids['email']) {
        setErrorText('कृपया वैध ईमेल प्रविष्ट करा / Please enter a valid email address.');
      } else if (newInvalids['countryId']) {
        setErrorText('कृपया देश निवडा / Please select a Country.');
      } else if (newInvalids['stateId']) {
        setErrorText('कृपया राज्य निवडा / Please select a State.');
      } else if (newInvalids['districtId']) {
        setErrorText('कृपया जिल्हा निवडा / Please select a District.');
      } else if (newInvalids['talukaId']) {
        setErrorText('कृपया तालुका निवडा / Please select a Taluka.');
      } else if (newInvalids['educationId']) {
        setErrorText('कृपया आपले सर्वोच्च शिक्षण निवडा / Please select your Education detail.');
      } else if (newInvalids['subEducationId']) {
        setErrorText('कृपया उप-शिक्षण क्षेत्र / स्पेशल निवडा / Please select your Sub-Education detail.');
      } else if (newInvalids['experience']) {
        if (experience.trim() === '') {
          setErrorText('कृपया कामाचा अनुभव अंकात प्रविष्ट करा (उदा. ०) / Please enter experience in years.');
        } else {
          setErrorText('कामाचा अनुभव वैध संख्येमध्ये प्रविष्ट करा. / Please enter a valid non-negative number of experience years.');
        }
      } else if (newInvalids['isTnCChecked']) {
        setErrorText('कृपया अटी आणि शर्ती मान्य करा. / You must agree to the Terms and Conditions.');
      }
      return;
    }

    setInvalidFields({});

    // Find Names for friendly profile summary storage
    const selectedCountry = countries.find(c => c.id === countryId)?.name || '';
    const selectedState = states.find(s => s.id === stateId)?.name || '';
    const selectedDistrict = districts.find(d => d.id === districtId)?.name || '';
    const selectedTaluka = talukas.find(t => t.id === talukaId)?.name || '';
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
      setToastMessage(`खाते यशस्वीरीत्या नोंदणीकृत झाले! / Account registered successfully!`);
    } catch (err: any) {
      setErrorText(err.data || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा. / Registration failed. Please try again.');
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

    if (!empAlternateContactPerson.trim()) {
      newInvalids['empAlternateContactPerson'] = true;
    }

    if (!empAlternateContactNumber.trim()) {
      newInvalids['empAlternateContactNumber'] = true;
    } else if (!mobilePattern.test(empAlternateContactNumber.trim())) {
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

    if (!empWebsite.trim()) {
      newInvalids['empWebsite'] = true;
    }

    if (!empAlternateEmail.trim()) {
      newInvalids['empAlternateEmail'] = true;
    } else if (!emailPattern.test(empAlternateEmail.trim().toLowerCase())) {
      newInvalids['empAlternateEmail'] = true;
    }

    if (!isTnCChecked) {
      newInvalids['isTnCChecked'] = true;
    }

    if (Object.keys(newInvalids).length > 0) {
      setInvalidFields(newInvalids);

      if (newInvalids['empFullName']) {
        setErrorText('कृपया कंपनीचे पूर्ण नाव प्रविष्ट करा / Please enter Company Full Name.');
      } else if (newInvalids['empMobile']) {
        if (!empMobile.trim()) {
          setErrorText('कृपया मोबाईल नंबर प्रविष्ट करा / Please enter Mobile Number.');
        } else {
          setErrorText('मोबाईल नंबर नक्की १० अंकी असावा / Mobile number must be exactly 10 digits.');
        }
      } else if (newInvalids['empAddress']) {
        setErrorText('कृपया पत्ता प्रविष्ट करा / Please enter Address.');
      } else if (newInvalids['empEmail']) {
        if (!empEmail.trim()) {
          setErrorText('कृपया मुख्य ईमेल प्रविष्ट करा / Please enter Email Address.');
        } else {
          setErrorText('कृपया वैध मुख्य ईमेल पत्ता प्रविष्ट करा / Please enter a valid main Email Address.');
        }
      } else if (newInvalids['empStateId']) {
        setErrorText('कृपया राज्य निवडा / Please select State.');
      } else if (newInvalids['empDistrictId']) {
        setErrorText('कृपया जिल्हा निवडा / Please select District.');
      } else if (newInvalids['empTalukaId']) {
        setErrorText('कृपया तालुका निवडा / Please select Taluka.');
      } else if (newInvalids['empContactPerson']) {
        setErrorText('कृपया मुख्य संपर्क व्यक्तीचे नाव प्रविष्ट करा / Please enter Contact Person.');
      } else if (newInvalids['empAlternateContactPerson']) {
        setErrorText('कृपया पर्यायी संपर्क व्यक्तीचे नाव प्रविष्ट करा / Please enter Alternate Contact Person.');
      } else if (newInvalids['empAlternateContactNumber']) {
        if (!empAlternateContactNumber.trim()) {
          setErrorText('कृपया पर्यायी संपर्क मोबाईल नंबर प्रविष्ट करा / Please enter Alternate Contact Number.');
        } else {
          setErrorText('पर्यायी संपर्क मोबाईल नंबर नक्की १० अंकी असावा / Alternate Contact Number must be exactly 10 digits.');
        }
      } else if (newInvalids['empCompanyTypeId']) {
        setErrorText('कृपया कंपनी प्रकार निवडा / Please select Company Type.');
      } else if (newInvalids['empIndustryTypeId']) {
        setErrorText('कृपया उद्योग प्रकार निवडा / Please select Industry Type.');
      } else if (newInvalids['empDescription']) {
        setErrorText('कृपया कंपनीचे संक्षिप्त वर्णन प्रविष्ट करा / Please enter Description.');
      } else if (newInvalids['empWebsite']) {
        setErrorText('कृपया कंपनीची वेबसाईट प्रविष्ट करा / Please enter Website.');
      } else if (newInvalids['empAlternateEmail']) {
        if (!empAlternateEmail.trim()) {
          setErrorText('कृपया पर्यायी ईमेल प्रविष्ट करा / Please enter Alternate Email.');
        } else {
          setErrorText('कृपया वैध पर्यायी ईमेल प्रविष्ट करा / Please enter a valid Alternate Email.');
        }
      } else if (newInvalids['isTnCChecked']) {
        setErrorText('कृपया अटी आणि शर्ती मान्य करा. / You must agree to the Terms and Conditions.');
      }
      return;
    }

    setInvalidFields({});

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
      setToastMessage('कंपनी/नियोक्ता नोंदणी यशस्वी झाली! / Employer Registration completed successfully!');
    } catch (err: any) {
      const serverErr = typeof err?.data === 'string' ? err.data : (err?.data?.error?.message || err?.message);
      setErrorText(serverErr || 'नोंदणी अयशस्वी. कृपया सर्व तपशील तपासा / Registration failed. Please check details.');
    }
  };

  const roleOptions = [
    { value: UserRole.CANDIDATE, label: 'उमेदवार / Candidate (Job Seeker)' },
    { value: UserRole.COMPANY, label: 'नियोक्ता / Employer (Recruiter)' },
    { value: UserRole.SHG, label: 'बचतगट / SHG (Self Help Group)' }
  ];

  return (
    <div className="min-h-screen bg-theme-cream flex flex-col antialiased font-sans">
      {/* Top Unified Navbar */}
      <Navbar activePage="register" compact />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col px-4 py-8 sm:py-12">
        <div className="m-auto w-full max-w-lg md:max-w-3xl lg:max-w-5xl text-center space-y-3 mb-6">
          {/* Brand Seal */}
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-md border border-theme-lightViolet flex items-center justify-center p-1.5 transform hover:scale-105 transition-transform">
            <img src="/home/logo.png" alt="SRG Logo" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-theme-darkViolet tracking-tight">
            नवीन नोंदणी / Register New Account
          </h1>

          <p className="text-xs text-theme-lavender font-extrabold uppercase tracking-wider bg-theme-lightViolet/60 inline-block px-4 py-1.5 rounded-full border border-theme-lightViolet">
            श्री स्वामी समर्थ सेवा व आध्यात्मिक विकास मार्ग (दिंडोरी प्रणीत)
          </p>
        </div>

        <div className="w-full max-w-lg md:max-w-3xl lg:max-w-5xl">
          <div className="bg-white/95 backdrop-blur-md py-6 sm:py-8 px-5 sm:px-10 rounded-3xl border border-theme-lightViolet/80 shadow-2xl space-y-6">

            {isRegisteredSuccess ? (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="bg-theme-lightViolet/40 border border-theme-lightViolet p-4 rounded-full mb-5">
                  <CheckCircle2 className="h-14 w-14 text-theme-deepTeal" />
                </div>

                <h3 className="text-xl font-bold text-theme-darkViolet mb-3">
                  नोंदणी यशस्वी झाली! / Registration Successful!
                </h3>

                <div className="bg-theme-cream/80 border border-theme-lightViolet/80 rounded-2xl p-5 text-left mb-6 max-w-xl w-full">
                  <p className="text-xs text-theme-darkViolet font-bold leading-normal mb-1">
                    पडताळणी आणि सक्रियकरण लिंक पाठविली आहे:
                  </p>
                  <p className="text-xs sm:text-sm text-theme-lavender font-bold leading-relaxed">
                    Verification activation link sent to your registered email
                  </p>
                  <div className="h-px bg-theme-lightViolet/60 my-3" />
                  <p className="text-xs text-slate-600 leading-normal">
                    कृपया तुमचा नोंदणीकृत मुख्य ईमेल आयडी (<span className="font-semibold text-theme-darkViolet">{registrationType === 'employer' ? empEmail : email}</span>) तपासा आणि तुमचे खाते सक्रिय करण्यासाठी ईमेल मधील दुव्यावर (Link) क्लिक करा.
                    <br />
                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                      Please check your registered main email ID (<span className="font-semibold text-theme-darkViolet">{registrationType === 'employer' ? empEmail : email}</span>) and click the activation link in the email to activate your account.
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-md">
                  <Link
                    to="/login"
                    className="btn-gloss flex-1 inline-flex items-center justify-center gap-2 bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-98"
                  >
                    लॉगिन पृष्ठावर जा / Go to Login Page
                  </Link>
                  <Link
                    to="/"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-theme-lightViolet/80 hover:bg-theme-lightViolet/30 text-slate-700 font-bold text-xs px-6 py-3 rounded-xl transition-all active:scale-98"
                  >
                    मुख्यपृष्ठ / Home
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
                      <span className="leading-tight text-[11px] block font-extrabold">नोकरी शोधक नोंदणी</span>
                      <span className="text-[9px] opacity-75 font-bold block">Job Seeker</span>
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
                      <span className="leading-tight text-[11px] block font-extrabold">नियोक्ता / उद्योजक</span>
                      <span className="text-[9px] opacity-75 font-bold block">Employer</span>
                    </div>
                  </button>
                </div>

              {registrationType === 'employer' ? (
                <form className="space-y-6" onSubmit={handleEmployerSubmit}>
                  {errorText && <Alert type="danger" message={errorText} />}

                  {/* Step Title */}
                  <div className="border-b border-theme-lightViolet/60 pb-3 text-left">
                    <h3 className="text-xs sm:text-sm font-black text-theme-darkViolet uppercase tracking-wide flex items-center gap-2">
                      <Building className="w-4 h-4 text-theme-lavender" />
                      <span>नियोक्ता नोंदणी माहिती / Employer Registration Details</span>
                    </h3>
                  </div>

                  {/* Row 1: Company Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>कंपनीचे नाव / Company Full Name *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. टाटा कन्सल्टन्सी सर्व्हिसेस / E.g. Tata Consultancy Services"
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
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>मोबाईल नंबर / Mobile Number (10 Digits) *</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="उदा. 9876543210"
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
                    </div>
                  </div>

                  {/* Row 2: Address & Main Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>पत्ता / Address *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. प्लॉट नं. १२, एमआयडीसी, नाशिक / E.g. Plot No 12, MIDC, Nashik"
                        className={`w-full text-xs p-3 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-slate-800 font-medium ${invalidFields['empAddress']
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
                    </div>

                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>मुख्य ईमेल आयडी / Main Email Address *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="उदा. hr@company.com"
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
                    </div>
                  </div>

                  {/* Location Details Cascading Selections */}
                  <div className="bg-theme-cream/80 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                      <MapPin className="w-4 h-4 text-theme-lavender" />
                      <span>स्थान माहिती / Location Details *</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">१. राज्य / State *</label>
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
                          <option value="0">--- राज्य निवडा / State ---</option>
                          {states.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          २. जिल्हा / District * {isLoadingEmpDistricts && <span className="text-[9px] text-theme-lavender">(...)</span>}
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
                          <option value="0">--- जिल्हा निवडा / District ---</option>
                          {empDistricts.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ३. तालुका / Taluka * {isLoadingEmpTalukas && <span className="text-[9px] text-theme-lavender">(...)</span>}
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
                          <option value="0">--- तालुका निवडा / Taluka ---</option>
                          {empTalukas.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Person Details */}
                  <div className="bg-theme-lightViolet/20 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                    <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                      <User className="w-4 h-4 text-theme-lavender" />
                      <span>संपर्क अधिकारी माहिती / Contact Person Details *</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">१. मुख्य संपर्क व्यक्ती / Contact Person *</label>
                        <input
                          type="text"
                          placeholder="उदा. राहुल शर्मा / Rahul Sharma"
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
                      </div>

                      <div className="text-left">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">२. पर्यायी संपर्क व्यक्ती / Alt Contact Person *</label>
                        <input
                          type="text"
                          placeholder="उदा. अमित पाटील / Amit Patil"
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
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">३. पर्यायी संपर्क क्रमांक / Alt Mobile (10 Digits) *</label>
                        <input
                          type="tel"
                          placeholder="उदा. 9123456789"
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
                        <span>कंपनी प्रकार / Company Type *</span>
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
                        <option value="1">खाजगी मर्यादित / Private Limited</option>
                        <option value="2">भागीदारी / Partnership</option>
                        <option value="3">एकल मालकी / Proprietorship</option>
                        <option value="4">सार्वजनिक मर्यादित / Public Limited</option>
                        <option value="5">सहकारी संस्था / Co-operative</option>
                        <option value="6">इतर / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>उद्योग प्रकार / Industry Type *</span>
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
                        <option value="1">माहिती तंत्रज्ञान / Information Technology (IT)</option>
                        <option value="2">उत्पादन आणि अभियांत्रिकी / Manufacturing & Engineering</option>
                        <option value="3">किरकोळ आणि विपणन / Retail & Sales</option>
                        <option value="4">शिक्षण आणि प्रशिक्षण / Education & Training</option>
                        <option value="5">आरोग्य सेवा / Healthcare</option>
                        <option value="6">बांधकाम आणि पायाभूत सुविधा / Construction & Infrastructure</option>
                        <option value="7">इतर / Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Website & Alternate Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-theme-lavender" />
                        <span>कंपनी वेबसाईट / Company Website *</span>
                      </label>
                      <input
                        type="text"
                        placeholder="उदा. www.company.com"
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
                        <span>पर्यायी ईमेल आयडी / Alternate Email Address *</span>
                      </label>
                      <input
                        type="email"
                        placeholder="उदा. support@company.com"
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
                      कंपनीचे संक्षिप्त वर्णन / Company Description *
                    </label>
                    <textarea
                      placeholder="उदा. आमच्याकडे विविध तांत्रिक व सेवा क्षेत्रामध्ये रोजगाराच्या उत्तम संधी उपलब्ध आहेत. / Brief description about company profile..."
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
                      मी सहमत आहे की वरील सर्व तपशील माझ्या सर्वोत्तम माहितीनुसार खरे आणि अचूक आहेत आणि मी{' '}
                      <button
                        type="button"
                        onClick={() => setIsOpenEula(true)}
                        className="text-theme-lavender font-bold hover:underline inline focus:outline-none cursor-pointer"
                      >
                        अटी आणि शर्ती (Terms and Conditions / Privacy Notice)
                      </button>{' '}
                      मान्य करतो/करते. / I agree that all details are accurate and I accept the{' '}
                      <button
                        type="button"
                        onClick={() => setIsOpenEula(true)}
                        className="text-theme-lavender font-bold hover:underline inline focus:outline-none cursor-pointer"
                      >
                        Terms and Conditions / Privacy Notice
                      </button>
                      . *
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isCompanyRegistering}
                    className="btn-gloss w-full py-3.5 px-6 rounded-xl bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCompanyRegistering ? 'नोंदणी प्रक्रिया सुरू आहे...' : 'नोंदणी पूर्ण करा / Submit Employer Registration'}
                  </button>
                </form>
              ) : (
                <>
                  <div className="border-b border-theme-lightViolet/60 pb-3 text-left">
                    <h3 className="text-xs sm:text-sm font-black text-theme-darkViolet uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-theme-deepTeal" />
                      <span>पायरी १: आपली माहिती भरा / Step 1: Complete Seva Portal Profile Details</span>
                    </h3>
                  </div>

                  <form className="space-y-6" onSubmit={handleRegisterSubmit}>
                    {errorText && <Alert type="danger" message={errorText} />}

                    {/* Grid 1: Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-theme-lavender" />
                          <span>पूर्ण नाव / Full Name *</span>
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. राजेश रमेश पाटील / E.g. Rajesh Patil"
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
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-theme-lavender" />
                          <span>मोबाईल नंबर / Mobile Number *</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="उदा. 9876543210"
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
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-theme-lavender" />
                          <span>ईमेल आयडी / Email Address (पर्यायी / Optional)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="उदा. name@domain.com"
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
                        <p className="text-[10px] text-slate-500 mt-1">रिकामे सोडू शकता. जर प्रविष्ट केले तर वैध ईमेल असावे.</p>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5">
                          लिंग / Gender *
                        </label>
                        <div className="flex gap-4 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-white hover:bg-theme-lightViolet/30 px-4 py-2.5 rounded-xl border border-theme-lightViolet/80 flex-1 transition-colors">
                            <input
                              type="radio"
                              name="gender"
                              value="M"
                              checked={gender === 'M'}
                              onChange={() => setGender('M')}
                              className="accent-theme-lavender scale-110"
                            />
                            <span>पुरुष / Male</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-white hover:bg-theme-lightViolet/30 px-4 py-2.5 rounded-xl border border-theme-lightViolet/80 flex-1 transition-colors">
                            <input
                              type="radio"
                              name="gender"
                              value="F"
                              checked={gender === 'F'}
                              onChange={() => setGender('F')}
                              className="accent-theme-lavender scale-110"
                            />
                            <span>महिला / Female</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Grid 2: Custom Live API Cascading Selections of Location */}
                    <div className="bg-theme-cream/80 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                      <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                        <MapPin className="w-4 h-4 text-theme-lavender" />
                        <span>स्थान माहिती / Location Details</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">१. देश / Country *</label>
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
                            <option value="0">--- देश निवडा / Select Country ---</option>
                            {countries.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            २. राज्य / State * {isLoadingStates && <span className="text-[9px] text-theme-lavender">(Loading...)</span>}
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
                            <option value="0">--- राज्य निवडा / Select State ---</option>
                            {states.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ३. जिल्हा / District * {isLoadingDistricts && <span className="text-[9px] text-theme-lavender">(...)</span>}
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
                            <option value="0">--- जिल्हा निवडा / District ---</option>
                            {districts.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            ४. तालुका / Taluka * {isLoadingTalukas && <span className="text-[9px] text-theme-lavender">(...)</span>}
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
                            <option value="0">--- तालुका निवडा / Taluka ---</option>
                            {talukas.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Grid 3: Education Detail Cascader and Experience */}
                    <div className="bg-theme-lightViolet/20 border border-theme-lightViolet/80 rounded-2xl p-4 sm:p-5 space-y-4">
                      <h4 className="text-xs font-black text-theme-darkViolet uppercase tracking-wider flex items-center gap-1.5 text-left border-b border-theme-lightViolet/60 pb-2">
                        <Award className="w-4 h-4 text-theme-deepTeal" />
                        <span>शिक्षण आणि अनुभव माहिती / Education & Work Experience *</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            १. सर्वोच्च शिक्षण पात्रता / Educational Detail * {isLoadingEducations && <span className="text-[9px] text-theme-deepTeal">(...)</span>}
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
                            <option value="0">--- शिक्षण निवडा / Educational Detail ---</option>
                            {educations.map(e => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="text-left">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            २. उप-शिक्षण क्षेत्र / Specialization Course * {isLoadingSubEducations && <span className="text-[9px] text-theme-deepTeal">(...)</span>}
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
                            <option value="0">--- उप-प्रकार निवडा / Specialization ---</option>
                            {subEducations.map(se => (
                              <option key={se.id} value={se.id}>{se.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="text-left">
                        <label className="block text-xs font-bold text-theme-darkViolet mb-1.5">
                          एकूण कामाचा अनुभव (वर्षे) / Experience (Years) *
                        </label>
                        <input
                          type="number"
                          placeholder="उदा. 0 (नवीन असल्यास ० टाका) / E.g. 2"
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
                        <p className="text-[10px] text-slate-500 mt-1">नवीन उमेदवारांसाठी 0 भरा / Enter 0 if fresher</p>
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
                        मी सहमत आहे की वरील सर्व तपशील माझ्या सर्वोत्तम माहितीनुसार खरे आणि अचूक आहेत आणि मी{' '}
                        <button
                          type="button"
                          onClick={() => setIsOpenEula(true)}
                          className="text-theme-lavender font-bold hover:underline inline focus:outline-none cursor-pointer"
                        >
                          अटी आणि शर्ती (Terms and Conditions / Privacy Notice)
                        </button>{' '}
                        मान्य करतो/करते. / I agree that all details are accurate and I accept the{' '}
                        <button
                          type="button"
                          onClick={() => setIsOpenEula(true)}
                          className="text-theme-lavender font-bold hover:underline inline focus:outline-none cursor-pointer"
                        >
                          Terms and Conditions / Privacy Notice
                        </button>
                        . *
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="btn-gloss w-full py-3.5 px-6 rounded-xl bg-theme-lavender hover:bg-theme-lavender/90 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isRegistering ? 'नोंदणी प्रक्रिया सुरू आहे...' : (t('auth.submitRegister') || 'नोंदणी पूर्ण करा / Submit Registration')}
                    </button>
                  </form>
                </>
              )}
            </>
          )}

          <div className="text-center text-xs font-semibold text-slate-500 border-t border-theme-lightViolet/60 pt-4 cursor-pointer">
            <Link to="/login" className="text-theme-lavender hover:underline font-bold">
              आधीच खाते आहे? लॉगिन करा / {t('auth.hasAccount') || 'Already have an account? Login here'}
            </Link>
          </div>
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
                अटी आणि शर्ती आणि गोपनीयता सूचना / Terms & Privacy Notice
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
                  महत्वाची गोपनीयता संमती / Privacy Content Notice:
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
                  मराठी भाषांतर / Marathi Translation:
                </p>
                <p className="text-slate-600">
                  "मी याद्वारे मान्य करतो/करते की मी ही गोपनीयता नोटीस वाचली आहे आणि समजली आहे.
                </p>
                <p className="text-slate-600 leading-normal">
                  मी वरील नमूद केलेल्या पद्धतीने माझ्या माहितीच्या प्रक्रियेस सहमत आहे आणि माझ्या नोकरीच्या अर्जाच्या संदर्भात ईमेल, दूरध्वनी आणि एसएमएस द्वारे संप्रेषण करण्यासाठी कंपनीला माझ्या वैयक्तिक माहितीचा वापर करण्यास संमती देत आहे."
                </p>
              </div>

              <div className="border-t border-theme-lightViolet/50 pt-3 space-y-2 text-[11px] text-slate-500">
                <h5 className="font-bold text-slate-700">१. माहिती संकलन आणि माहिती सुरक्षा / Information Collection & Security</h5>
                <p>
                  आम्ही संकलित केलेली माहिती केवळ जॉब प्लेसमेंट, करिअर कौन्सिलिंग आणि कौशल्य वृद्धी उपक्रमांसाठी वापरली जाईल. आपली सर्व वैयक्तिक माहिती पूर्णपणे सुरक्षित ठेवली जाईल आणि अनधिकृत व्यक्तींसोबत सामायिक केली जाणार नाही.
                </p>
                <p>
                  All personal data including Contact information, Qualification details, and Placement history are governed by stringent confidentiality guidelines of Shri Swami Samarth Seva Marg recruitment portal.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-theme-cream/60 border-t border-theme-lightViolet/60 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsOpenEula(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-theme-lightViolet/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करा / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTnCChecked(true);
                  setIsOpenEula(false);
                }}
                className="btn-gloss px-5 py-2 bg-theme-lavender hover:bg-theme-lavender/90 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                मी वाचले आणि सहमत आहे / I Have Read & Agree
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
