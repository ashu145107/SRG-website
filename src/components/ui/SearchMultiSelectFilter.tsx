import React, { useEffect, useRef, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

export interface SearchFilterOption {
  label: string;
  value: string;
}

interface SearchMultiSelectFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filterLabel: string;
  options: SearchFilterOption[];
  selectedValues: string[];
  onSelectedValuesChange: (values: string[]) => void;
}

export function SearchMultiSelectFilter({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterLabel,
  options,
  selectedValues,
  onSelectedValuesChange,
}: SearchMultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftValues, setDraftValues] = useState<string[]>(selectedValues);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDraftValues(selectedValues);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, selectedValues]);

  const toggleOption = (value: string) => {
    setDraftValues(
      draftValues.includes(value)
        ? draftValues.filter((selected) => selected !== value)
        : [...draftValues, value]
    );
  };

  return (
    <div className="flex min-w-0 items-center gap-2" ref={containerRef}>
      <div className="relative min-w-0 flex-1">
        <div className="flex min-h-9 min-w-0 flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 transition focus-within:border-theme-lavender focus-within:ring-2 focus-within:ring-theme-lavender/20">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          {selectedValues.map((value) => {
            const label = options.find((option) => option.value === value)?.label || value;
            return (
              <span
                key={value}
                className="inline-flex max-w-full items-center gap-1 rounded-full bg-theme-lightViolet/60 px-2.5 py-1 text-xs font-medium text-theme-darkViolet"
              >
                <span className="truncate">{label}</span>
                <button
                  type="button"
                  aria-label={`Remove ${label} filter`}
                  onClick={() => onSelectedValuesChange(selectedValues.filter((selected) => selected !== value))}
                  className="shrink-0 rounded-full p-0.5 transition-colors hover:bg-theme-lavender/30"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          <input
            type="search"
            aria-label={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="min-w-[7rem] flex-1 border-0 bg-transparent py-1 text-xs text-slate-700 outline-none"
          />
        <button
          type="button"
          aria-label={`Filter ${filterLabel.toLowerCase()}`}
          aria-expanded={isOpen}
          onClick={() => {
            if (!isOpen) setDraftValues(selectedValues);
            setIsOpen((open) => !open);
          }}
          className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
            isOpen || selectedValues.length > 0
              ? 'bg-theme-lightViolet/50 text-theme-darkViolet'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter className="h-4 w-4" />
        </button>
        </div>

        {isOpen && (
          <div className="absolute right-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="mb-3">
              <span className="text-xs font-bold text-slate-700">{filterLabel}</span>
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto">
              {options.length === 0 ? (
                <p className="px-2 py-3 text-xs text-slate-500">No statuses available</p>
              ) : options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={draftValues.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 rounded border-slate-300 accent-theme-lavender"
                  />
                  <span className="break-words">{option.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setDraftValues(selectedValues);
                  setIsOpen(false);
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={draftValues.length === 0}
                onClick={() => {
                  onSelectedValuesChange(draftValues);
                  setIsOpen(false);
                }}
                className="rounded-lg bg-theme-lavender px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-theme-darkViolet disabled:cursor-not-allowed disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchMultiSelectFilter;
