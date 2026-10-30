import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useActivateAccountMutation } from '../services/authApi';
import { Loader2, CheckCircle2, XCircle, ShieldAlert, ArrowRight, Home } from 'lucide-react';

export default function ActivateAccount() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Robustly extract activation token/code ('d', 'token', or 'code') from:
  // 1. Raw window.location.href (to preserve '+' characters and avoid URLSearchParams converting them to spaces)
  // 2. React Router searchParams (after the hash)
  // 3. Fallback: Parse manually from window.location.hash query portion
  const getActivationCode = (): string | null => {
    // 1. Raw extraction from entire href to avoid '+' being decoded to space
    const href = window.location.href;
    const regex = /[?&](?:d|token|code)=([^&#\s]*)/i;
    const match = regex.exec(href);
    if (match) {
      const rawValue = match[1];
      try {
        return decodeURIComponent(rawValue);
      } catch (e) {
        return rawValue;
      }
    }

    const codeFromRouter = searchParams.get('d') || searchParams.get('token') || searchParams.get('code');
    if (codeFromRouter) return codeFromRouter;

    const hash = window.location.hash;
    const qMarkIndex = hash.indexOf('?');
    if (qMarkIndex !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qMarkIndex));
      const codeFromHash = hashParams.get('d') || hashParams.get('token') || hashParams.get('code');
      if (codeFromHash) return codeFromHash;
    }

    return null;
  };

  const code = getActivationCode();
  
  const [activateAccount, { isLoading }] = useActivateAccountMutation();
  const [activationResult, setActivationResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    if (!code) {
      setActivationResult({
        success: false,
        message: t('activate.invalidLinkTitle'),
        details: t('activate.invalidLinkDetails'),
      });
      return;
    }

    const performActivation = async () => {
      try {
        console.log('[ActivateAccount] Calling activation API with code:', code);
        const result = await activateAccount({ code }).unwrap();
        console.log('[ActivateAccount] API Result:', result);

        // Check isSuccess, success, or if response is successful
        const isSuccess = (result as any)?.isSuccess === true || (result as any)?.success === true || (result as any)?.data?.isSuccess === true || (result as any)?.data?.success === true;

        if (isSuccess) {
          setActivationResult({
            success: true,
            message: t('activate.successTitle'),
            details: t('activate.successDetails'),
          });
        } else {
          // Check for error in response body
          const errorMsg = result?.error?.message || (result as any)?.message || t('activate.linkInvalidOrUsed');
          setActivationResult({
            success: false,
            message: t('activate.failedTitle'),
            details: errorMsg,
          });
        }
      } catch (err: any) {
        console.error('[ActivateAccount] Mutation failed:', err);
        const errorMsg = err?.data || err?.message || t('activate.serverErrorMsg');
        setActivationResult({
          success: false,
          message: t('activate.serverErrorTitle'),
          details: errorMsg,
        });
      }
    };

    performActivation();
  }, [code, activateAccount]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg m-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center relative z-10"
      >
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <img src="/home/logo.png" alt="Logo" className="h-16 w-auto object-contain mb-3" onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }} />
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {t('activate.brandName')}
          </h2>
          <p className="text-xs text-slate-500 font-medium">SRG Employment Portal</p>
        </div>

        <div className="h-px bg-slate-100 w-full mb-8" />

        {/* Loading State */}
        {isLoading && (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="h-14 w-14 text-orange-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {t('activate.activatingTitle')}
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Activating your account, please wait...
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {t('activate.verifying')}
            </p>
          </div>
        )}

        {/* Result State */}
        {!isLoading && activationResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="py-4"
          >
            {activationResult.success ? (
              // Success UI
              <div className="flex flex-col items-center">
                <div className="bg-emerald-50 p-4 rounded-full mb-4 border border-emerald-100">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {activationResult.message}
                </h3>
                
                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-4 text-left mb-8 w-full">
                  <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                    {activationResult.details}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <Link
                    to="/login"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-98"
                  >
                    {t('activate.loginBtn')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              // Failure UI
              <div className="flex flex-col items-center">
                <div className="bg-red-50 p-4 rounded-full mb-4 border border-red-100">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {activationResult.message}
                </h3>

                <div className="bg-red-50/50 border border-red-100/60 rounded-xl p-4 text-left mb-8 w-full flex gap-3 items-start">
                  <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-800 font-bold leading-normal mb-1">
                      {t('activate.errorDetails')}
                    </p>
                    <p className="text-xs text-red-700 font-medium leading-relaxed">
                      {activationResult.details}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Link
                    to="/login"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all active:scale-98"
                  >
                    {t('auth.goToLogin')}
                  </Link>
                  <Link
                    to="/"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl transition-all active:scale-98"
                  >
                    <Home className="h-3.5 w-3.5" />
                    {t('activate.home')}
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Footer copyright */}
      <p className="text-[11px] text-slate-400 mt-6 relative z-10 font-medium text-center">
        {t('activate.copyright', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
