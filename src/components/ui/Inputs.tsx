/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const TextBox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
        <input
          ref={ref}
          id={`input-txt-${props.id || props.name || Math.random().toString(36).substr(2, 5)}`}
          className={`w-full px-4 py-2.5 bg-gray-50 border ${
            error ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-orange-500'
          } rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 placeholder-gray-400`}
          {...props}
        />
        {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
TextBox.displayName = 'TextBox';

export const PasswordBox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type={show ? 'text' : 'password'}
            id={`input-pwd-${props.id || props.name || Math.random().toString(36).substr(2, 5)}`}
            className={`w-full pl-4 pr-11 py-2.5 bg-gray-50 border ${
              error ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-orange-500'
            } rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 placeholder-gray-400`}
            {...props}
          />
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
PasswordBox.displayName = 'PasswordBox';

export const SearchBox = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input
            ref={ref}
            id={`input-search-${props.id || props.name || Math.random().toString(36).substr(2, 5)}`}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
            {...props}
          />
        </div>
      </div>
    );
  }
);
SearchBox.displayName = 'SearchBox';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
        <textarea
          ref={ref}
          id={`input-area-${props.id || props.name || Math.random().toString(36).substr(2, 5)}`}
          rows={3}
          className={`w-full px-4 py-2.5 bg-gray-50 border ${
            error ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-orange-500'
          } rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900 placeholder-gray-400`}
          {...props}
        />
        {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
TextArea.displayName = 'TextArea';

export const NumberInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <TextBox
        ref={ref}
        type="number"
        label={label}
        error={error}
        {...props}
      />
    );
  }
);
NumberInput.displayName = 'NumberInput';

export const CurrencyInput = React.forwardRef<HTMLInputElement, InputProps & { currencySymbol?: string }>(
  ({ label, error, currencySymbol = '₹', className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
            {currencySymbol}
          </span>
          <input
            ref={ref}
            type="text"
            id={`input-curr-${props.id || props.name || Math.random().toString(36).substr(2, 5)}`}
            className={`w-full pl-8 pr-4 py-2.5 bg-gray-50 border ${
              error ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-orange-500'
            } rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900`}
            {...props}
          />
        </div>
        {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';

export const OTPInput: React.FC<{
  length?: number;
  onChange: (otp: string) => void;
  error?: string;
}> = ({ length = 4, onChange, error }) => {
  const [vals, setVals] = useState(new Array(length).fill(''));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newVals = [...vals];
    newVals[idx] = val.substring(val.length - 1);
    setVals(newVals);
    onChange(newVals.join(''));

    // Move focus onward if typed
    if (val && e.target.nextSibling) {
      (e.target.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !vals[idx] && e.currentTarget.previousSibling) {
      (e.currentTarget.previousSibling as HTMLInputElement).focus();
    }
  };

  return (
    <div className="w-full text-center">
      <div className="flex gap-3 justify-center mb-2">
        {vals.map((v, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            value={v}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className="w-12 h-12 text-center text-lg font-bold border border-gray-200 uppercase bg-gray-50 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-xl transition-all"
          />
        ))}
      </div>
      {error && <span className="block text-xs text-red-500 text-center mt-1">{error}</span>}
    </div>
  );
};
