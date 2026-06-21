/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useRegisterMutation } from '../services/authApi';
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
import { UserRole } from '../types';
import { ArrowLeft, User, Phone, Mail, Award, CheckCircle2, MapPin } from 'lucide-react';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

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

  // Register mutation
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

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
    if (!name.trim()) {
      setErrorText('कृपया आपले संपूर्ण नाव प्रविष्ट करा / Please enter your full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorText('कृपया तुमचा मोबाईल नंबर प्रविष्ट करा / Please enter your mobile number.');
      return;
    }

    // Phone format pattern (numeric check)
    if (!/^\d+$/.test(phone.trim()) || phone.trim().length < 10 || phone.trim().length > 15) {
      setErrorText('मोबाईल नंबर चुकीचा आहे (कृपया १० ते १५ अंकी वैध क्रमांक टाका). / Mobile number must be 10 to 15 numeric digits.');
      return;
    }

    // Email id is not compulsory, but if email is written, validate email format
    if (email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim().toLowerCase())) {
        setErrorText('कृपया वैध ईमेल प्रविष्ट करा / Please enter a valid email address.');
        return;
      }
    }

    if (!countryId) {
      setErrorText('कृपया देश निवडा / Please select a Country.');
      return;
    }

    if (!stateId) {
      setErrorText('कृपया राज्य निवडा / Please select a State.');
      return;
    }

    if (!districtId) {
      setErrorText('कृपया जिल्हा निवडा / Please select a District.');
      return;
    }

    if (!talukaId) {
      setErrorText('कृपया तालुका निवडा / Please select a Taluka.');
      return;
    }

    if (!educationId) {
      setErrorText('कृपया आपले सर्वोच्च शिक्षण निवडा / Please select your Education detail.');
      return;
    }

    if (!subEducationId) {
      setErrorText('कृपया उप-शिक्षण क्षेत्र / स्पेशल निवडा / Please select your Sub-Education detail.');
      return;
    }

    if (experience.trim() === '') {
      setErrorText('कृपया कामाचा अनुभव अंकात प्रविष्ट करा (उदा. ०) / Please enter experience in years.');
      return;
    }

    if (isNaN(Number(experience)) || Number(experience) < 0) {
      setErrorText('कामाचा अनुभव वैध संख्येमध्ये प्रविष्ट करा. / Please enter a valid non-negative number of experience years.');
      return;
    }

    if (!isTnCChecked) {
      setErrorText('कृपया अटी आणि शर्ती मान्य करा. / You must agree to the Terms and Conditions.');
      return;
    }

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

      dispatch(setCredentials(response));
      setToastMessage(`खाते यशस्वीरीत्या नोंदणीकृत झाले! / Account registered successfully!`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorText(err.data || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा. / Registration failed. Please try again.');
    }
  };

  const roleOptions = [
    { value: UserRole.CANDIDATE, label: 'उमेदवार / Candidate (Job Seeker)' },
    { value: UserRole.COMPANY, label: 'नियोक्ता / Employer (Recruiter)' },
    { value: UserRole.SHG, label: 'बचतगट / SHG (Self Help Group)' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative antialiased font-sans">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> {t('nav.home') || 'Home'}
        </Link>
        
        {/* Sacred Brand Mark */}
        <div className="mx-auto w-14 h-14 bg-linear-to-tr from-orange-500 to-amber-500 rounded-full flex items-center justify-center font-extrabold text-white text-2xl shadow-md border-2 border-white animate-pulse">
          श्री
        </div>
        
        <h2 className="mt-3 text-3xl font-black text-blue-950 tracking-tight">
          नवीन नोंदणी / Register New Account
        </h2>
        
        <p className="text-xs text-orange-600 font-extrabold uppercase mt-1.5 tracking-wider bg-orange-50 inline-block px-3 py-1 rounded-full border border-orange-100">
          श्री स्वामी समर्थ सेवा व आध्यात्मिक विकास मार्ग (दिंडोरी प्रणीत)
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
              <span>पायरी १: आपली माहिती भरा / Step 1: Complete Seva Portal Profile Details</span>
            </h3>
          </div>

          <form className="space-y-6" onSubmit={handleRegisterSubmit}>
            {errorText && <Alert type="danger" message={errorText} />}

            {/* Grid 1: Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span>पूर्ण नाव / Full Name *</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. राजेश रमेश पाटील / E.g. Rajesh Patil"
                  className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-medium transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  <span>मोबाईल नंबर / Mobile Number *</span>
                </label>
                <input
                  type="tel"
                  placeholder="उदा. 9876543210"
                  className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-medium transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-left">
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-orange-500" />
                  <span>ईमेल आयडी / Email Address (पर्यायी / Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="उदा. name@domain.com"
                  className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-medium transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={100}
                />
                <p className="text-[10px] text-slate-400 mt-1">रिकामे सोडू शकता. जर प्रविष्ट केले तर वैध ईमेल असावे.</p>
              </div>

              <div className="text-left">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  लिंग / Gender *
                </label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-50 hover:bg-orange-50/50 px-4 py-2.5 rounded-xl border border-gray-100 flex-1 transition-colors">
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={gender === 'M'}
                      onChange={() => setGender('M')}
                      className="accent-orange-600 scale-110"
                    />
                    <span>पुरुष / Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700 bg-gray-50 hover:bg-orange-50/50 px-4 py-2.5 rounded-xl border border-gray-100 flex-1 transition-colors">
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={gender === 'F'}
                      onChange={() => setGender('F')}
                      className="accent-orange-600 scale-110"
                    />
                    <span>महिला / Female</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Grid 2: Custom Live API Cascading Selections of Location */}
            <div className="bg-orange-50/45 border border-orange-100 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black text-orange-850 uppercase tracking-wider flex items-center gap-1 text-left border-b border-orange-100/60 pb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>स्थान माहिती / Location Details (Real API Swagger Integration)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">१. देश / Country *</label>
                  <select
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-750 font-bold transition-all disabled:opacity-60"
                    value={countryId}
                    onChange={(e) => {
                      setCountryId(Number(e.target.value));
                      setStateId(0);
                      setDistrictId(0);
                      setTalukaId(0);
                      setSevaKendraId(0);
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
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    २. राज्य / State * {isLoadingStates && <span className="text-[9px] text-orange-600">(Loading...)</span>}
                  </label>
                  <select
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-750 font-bold transition-all disabled:opacity-60"
                    value={stateId}
                    onChange={(e) => {
                      setStateId(Number(e.target.value));
                      setDistrictId(0);
                      setTalukaId(0);
                      setSevaKendraId(0);
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
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    ३. जिल्हा / District * {isLoadingDistricts && <span className="text-[9px] text-orange-600">(...)</span>}
                  </label>
                  <select
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-750 font-bold transition-all disabled:opacity-60"
                    value={districtId}
                    onChange={(e) => {
                      setDistrictId(Number(e.target.value));
                      setTalukaId(0);
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
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    ४. तालुका / Taluka * {isLoadingTalukas && <span className="text-[9px] text-orange-600">(...)</span>}
                  </label>
                  <select
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-750 font-bold transition-all disabled:opacity-60"
                    value={talukaId}
                    onChange={(e) => {
                      setTalukaId(Number(e.target.value));
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

            {/* Grid 3: Education Detail Cascader and Experience (Enter experience in years) */}
            <div className="bg-teal-50/30 border border-teal-100 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider flex items-center gap-1 text-left border-b border-teal-100 pb-2">
                <Award className="w-4 h-4 text-teal-600" />
                <span>शिक्षण आणि अनुभव माहिती / Education & Work Experience *</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    १. सर्वोच्च शिक्षण पात्रता / Educational Detail * {isLoadingEducations && <span className="text-[9px] text-teal-600">(...)</span>}
                  </label>
                  <select
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-750 font-bold transition-all disabled:opacity-60"
                    value={educationId}
                    onChange={(e) => {
                      setEducationId(Number(e.target.value));
                      setSubEducationId(0);
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
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">
                    २. उप-शिक्षण क्षेत्र / Specialization Course * {isLoadingSubEducations && <span className="text-[9px] text-teal-600">(...)</span>}
                  </label>
                  <select
                    className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-750 font-bold transition-all disabled:opacity-60"
                    value={subEducationId}
                    onChange={(e) => setSubEducationId(Number(e.target.value))}
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  एकूण कामाचा अनुभव (वर्षे) / Experience (Years) *
                </label>
                <input
                  type="number"
                  placeholder="उदा. 0 (नवीन असल्यास ० टाका) / E.g. 2"
                  min="0"
                  max="60"
                  className="w-full sm:w-1/2 text-xs p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-750 font-bold transition-all"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">नवीन उमेदवारांसाठी 0 भरा / Enter 0 if fresher</p>
              </div>
            </div>

            {/* Terms and Conditions Checkbox with EULA Link */}
            <div className="flex items-start gap-2 text-left pt-2 border-t border-gray-100">
              <input
                id="IsTnCChecked"
                type="checkbox"
                checked={isTnCChecked}
                onChange={(e) => setIsTnCChecked(e.target.checked)}
                className="mt-1 accent-orange-600 w-4 h-4 cursor-pointer rounded-sm"
              />
              <label htmlFor="IsTnCChecked" className="text-xs font-semibold text-slate-700 leading-snug select-none">
                मी सहमत आहे की वरील सर्व तपशील माझ्या सर्वोत्तम माहितीनुसार खरे आणि अचूक आहेत आणि मी{' '}
                <button
                  type="button"
                  onClick={() => setIsOpenEula(true)}
                  className="text-blue-600 font-bold hover:underline inline focus:outline-none cursor-pointer"
                >
                  अटी आणि शर्ती (Terms and Conditions / Privacy Notice)
                </button>{' '}
                मान्य करतो/करते. / I agree that all details are accurate and I accept the{' '}
                <button
                  type="button"
                  onClick={() => setIsOpenEula(true)}
                  className="text-blue-600 font-bold hover:underline inline focus:outline-none cursor-pointer"
                >
                  Terms and Conditions / Privacy Notice
                </button>
                . *
              </label>
            </div>

            <PrimaryButton type="submit" loading={isRegistering} className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 shadow-md">
              {t('auth.submitRegister') || 'नोंदणी पूर्ण करा / Submit Registration'}
            </PrimaryButton>
          </form>

          <div className="text-center text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4 cursor-pointer">
            <Link to="/login" className="text-orange-600 hover:underline">
              आधीच खाते आहे? लॉगिन करा / {t('auth.hasAccount') || 'Already have an account? Login here'}
            </Link>
          </div>
        </div>
      </div>

      {/* EULA Popup Modal */}
      {isOpenEula && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in animate-duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-linear-to-r from-orange-50 to-amber-50 flex justify-between items-center">
              <h3 className="font-bold text-blue-950 text-sm sm:text-base flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></span>
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
              <div className="p-4 bg-blue-50/70 border border-blue-100/60 rounded-xl space-y-3 font-medium">
                <p className="text-blue-950 font-bold text-xs uppercase tracking-wider mb-1">
                  महत्वाची गोपनीयता संमती / Privacy Content Notice:
                </p>
                <p className="text-slate-700 italic font-bold">
                  "I further acknowledge that I have read and understand this Privacy Notice by checking the box.
                </p>
                <p className="text-slate-700 italic font-bold leading-normal">
                  I agree to the processing of my data in the outlined manner and consent to the Company using my personal information to communicate with me via email, telephone and SMS communications regarding my job application"
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="font-extrabold text-slate-800 text-xs">
                  मराठी भाषांतर / Marathi Translation:
                </p>
                <p className="text-slate-600">
                  "मी याद्वारे मान्य करतो/करते की मी ही गोपनीयता नोटीस वाचली आहे आणि समजली आहे.
                </p>
                <p className="text-slate-600 leading-normal">
                  मी वरील नमूद केलेल्या पद्धतीने माझ्या माहितीच्या प्रक्रियेस सहमत आहे आणि माझ्या नोकरीच्या अर्जाच्या संदर्भात ईमेल, दूरध्वनी आणि एसएमएस द्वारे संप्रेषण करण्यासाठी कंपनीला माझ्या वैयक्तिक माहितीचा वापर करण्यास संमती देत आहे."
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] text-slate-500">
                <h5 className="font-bold text-slate-750">१. माहिती संकलन आणि माहिती सुरक्षा / Information Collection & Security</h5>
                <p>
                  आम्ही संकलित केलेली माहिती केवळ जॉब प्लेसमेंट, करिअर कौन्सिलिंग आणि कौशल्य वृद्धी उपक्रमांसाठी वापरली जाईल. आपली सर्व वैयक्तिक माहिती पूर्णपणे सुरक्षित ठेवली जाईल आणि अनधिकृत व्यक्तींसोबत सामायिक केली जाणार नाही.
                </p>
                <p>
                  All personal data including Contact information, Qualification details, and Placement history are governed by stringent confidentiality guidelines of Shri Swami Samarth Seva Marg recruitment portal.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsOpenEula(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                रद्द करा / Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTnCChecked(true);
                  setIsOpenEula(false);
                }}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
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
