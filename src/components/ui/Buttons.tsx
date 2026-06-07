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
      className={`px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm ${className}`}
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
      className={`px-5 py-2.5 bg-white border border-gray-200 text-blue-900 hover:bg-gray-50 font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-900" />}
      {children}
    </button>
  );
};

export const DangerButton: React.FC<ButtonProps> = ({ children, loading, className = '', ...props }) => {
  return (
    <button
      id={`btn-danger-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm ${className}`}
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
      className={`p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center ${className}`}
      {...props}
    >
      {props.disabled ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : icon}
    </button>
  );
};

export const LinkButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => {
  return (
    <button
      id={`btn-link-${props.id || Math.random().toString(36).substr(2, 5)}`}
      className={`text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors cursor-pointer text-sm bg-transparent border-none p-0 flex items-center gap-1 ${className}`}
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
      className={`px-5 py-2.5 bg-orange-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 text-sm ${className}`}
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
