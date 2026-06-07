/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => {
  const checkboxId = props.id || `checkbox-${Math.random().toString(36).substr(2, 5)}`;
  return (
    <label htmlFor={checkboxId} className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-gray-700">
      <input
        type="checkbox"
        id={checkboxId}
        className="sr-only peer"
        {...props}
      />
      <div className="w-5 h-5 border border-gray-200 rounded-md bg-gray-50 peer-checked:bg-orange-600 peer-checked:border-orange-600 flex items-center justify-center transition-all">
        <Check className="w-3.5 h-3.5 text-white stroke-[3.5]" />
      </div>
      <span>{label}</span>
    </label>
  );
};

interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio: React.FC<RadioProps> = ({ label, className = '', ...props }) => {
  const radioId = props.id || `radio-${Math.random().toString(36).substr(2, 5)}`;
  return (
    <label htmlFor={radioId} className="flex items-center gap-2.5 cursor-pointer select-none text-sm text-gray-700">
      <input
        type="radio"
        id={radioId}
        className="sr-only peer"
        {...props}
      />
      <div className="w-5 h-5 border border-gray-200 rounded-full bg-gray-50 peer-checked:border-orange-600 flex items-center justify-center transition-all">
        <div className="w-2.5 h-2.5 bg-orange-600 rounded-full scale-0 peer-checked:scale-100 transition-transform duration-150" />
      </div>
      <span>{label}</span>
    </label>
  );
};

interface ToggleSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onToggle, ...props }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none text-sm font-semibold text-gray-700">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onToggle(e.target.checked)}
          {...props}
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-orange-600' : 'bg-gray-200'}`} />
        <div
          className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-sm transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span>{label}</span>}
    </label>
  );
};

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: DropdownOption[];
  error?: string;
}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full text-left">
        {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            id={`select-${props.id || props.name || Math.random().toString(36).substr(2, 5)}`}
            className={`w-full px-4 py-2.5 bg-gray-50 border ${
              error ? 'border-red-500 bg-red-50/10' : 'border-gray-200 focus:border-orange-500'
            } rounded-xl text-sm appearance-none focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-4.5 h-4.5" />
          </div>
        </div>
        {error && <span className="block text-xs text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);
Dropdown.displayName = 'Dropdown';

interface MultiSelectProps {
  label?: string;
  options: DropdownOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options'
}) => {
  const handleToggle = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="w-full text-left">
      {label && <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>}
      <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-200 rounded-xl min-h-[44px]">
        {selectedValues.length === 0 && (
          <span className="text-gray-400 text-sm p-1.5">{placeholder}</span>
        )}
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                isSelected
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handleToggle(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
