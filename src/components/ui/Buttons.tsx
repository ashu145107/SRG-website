/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ children, loading, className = '', ...props }) => {
  return (
    <button
      id={`btn-primary-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`btn-gloss px-6 py-3 bg-theme-lavender hover:bg-theme-darkViolet text-white font-bold rounded-xl transition-all duration-200 shadow-md shadow-theme-lavender/30 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm cursor-pointer ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({ children, loading, className = '', ...props }) => {
  return (
    <button
      id={`btn-secondary-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`px-6 py-3 bg-white border-2 border-theme-lightViolet text-theme-darkViolet hover:border-theme-lavender hover:text-theme-lavender font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm cursor-pointer ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-theme-lavender" />}
      {children}
    </button>
  );
};

export const DangerButton: React.FC<ButtonProps> = ({ children, loading, className = '', ...props }) => {
  return (
    <button
      id={`btn-danger-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`btn-gloss px-6 py-3 bg-theme-wine hover:bg-theme-darkViolet text-white font-bold rounded-xl transition-all duration-200 shadow-md active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm cursor-pointer ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const IconButton: React.FC<ButtonProps & { icon: React.ReactNode }> = ({ icon, className = '', ...props }) => {
  return (
    <button
      id={`btn-icon-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`p-2.5 bg-white border border-theme-lightViolet hover:bg-theme-lightViolet text-theme-darkViolet rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer ${className}`}
      {...props}
    >
      {props.disabled ? <Loader2 className="w-4 h-4 animate-spin text-theme-lavender" /> : icon}
    </button>
  );
};

export const LinkButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      id={`btn-link-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`text-theme-lavender hover:text-theme-darkViolet hover:underline font-bold transition-colors cursor-pointer text-sm bg-transparent border-none p-0 flex items-center gap-1 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const LoadingButton: React.FC<ButtonProps & { loadingText?: string }> = ({
  children,
  loading = true,
  loadingText = 'Please wait...',
  className = '',
  ...props
}) => {
  return (
    <button
      id={`btn-loading-${props.id || Math.random().toString(36).substr(2, 5)}`}
      type="submit"
      className={`btn-gloss px-6 py-3 bg-theme-lavender hover:bg-theme-darkViolet text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-theme-lavender/30 cursor-pointer ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
