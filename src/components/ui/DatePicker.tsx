/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
}

const MONTHS = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2020, month, 1))
);
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const parseDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1])
    && date.getMonth() === Number(match[2]) - 1
    && date.getDate() === Number(match[3])
    ? date
    : null;
};

const formatDate = (year: number, month: number, day: number): string =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const dateOnly = (value?: string): string => value?.slice(0, 10) || '';

export const DatePicker: React.FC<DatePickerProps> = ({
  name,
  value,
  onChange,
  className = '',
  disabled = false,
  required = false,
  min,
  max,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
}) => {
  const selectedDate = parseDate(dateOnly(value));
  const today = new Date();
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? today.getMonth());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarPosition, setCalendarPosition] = useState<React.CSSProperties>({
    position: 'fixed',
    visibility: 'hidden',
  });

  const minDate = parseDate(dateOnly(min));
  const maxDate = parseDate(dateOnly(max));
  const minYear = Math.min(minDate?.getFullYear() ?? 1900, selectedDate?.getFullYear() ?? 1900);
  const maxYear = Math.max(maxDate?.getFullYear() ?? today.getFullYear() + 20, selectedDate?.getFullYear() ?? 0);
  const years = useMemo(
    () => Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index),
    [minYear, maxYear]
  );
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !calendarRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const updateCalendarPosition = useCallback(() => {
    const trigger = wrapperRef.current;
    const calendar = calendarRef.current;
    if (!trigger || !calendar) return;

    const triggerRect = trigger.getBoundingClientRect();
    const viewportPadding = 8;
    const gap = 6;
    const width = Math.min(320, window.innerWidth - viewportPadding * 2);
    const height = calendar.offsetHeight;
    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const placeAbove = spaceBelow < height + gap && triggerRect.top > spaceBelow;
    const left = Math.max(
      viewportPadding,
      Math.min(triggerRect.left, window.innerWidth - width - viewportPadding)
    );
    const top = placeAbove
      ? Math.max(viewportPadding, triggerRect.top - height - gap)
      : Math.min(window.innerHeight - height - viewportPadding, triggerRect.bottom + gap);

    setCalendarPosition({ position: 'fixed', top, left, width, visibility: 'visible' });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updateCalendarPosition();
    window.addEventListener('resize', updateCalendarPosition);
    window.addEventListener('scroll', updateCalendarPosition, true);
    return () => {
      window.removeEventListener('resize', updateCalendarPosition);
      window.removeEventListener('scroll', updateCalendarPosition, true);
    };
  }, [isOpen, updateCalendarPosition, viewMonth, viewYear]);

  const openCalendar = () => {
    if (disabled) return;
    const initialDate = selectedDate ?? today;
    setViewYear(initialDate.getFullYear());
    setViewMonth(initialDate.getMonth());
    setIsOpen((open) => !open);
  };

  const changeMonth = (offset: number) => {
    const next = new Date(viewYear, viewMonth + offset, 1);
    if (next.getFullYear() < minYear || next.getFullYear() > maxYear) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isDateDisabled = (day: number) => {
    const candidate = formatDate(viewYear, viewMonth, day);
    return Boolean((min && candidate < dateOnly(min)) || (max && candidate > dateOnly(max)));
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={dateOnly(value)}
          readOnly
          required={required}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onChange={(event) => onChange(event.target.value)}
          onClick={openCalendar}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openCalendar();
            }
          }}
          className={`${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} pr-10`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={openCalendar}
          aria-label={`Choose ${ariaLabel || name}`}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {isOpen && createPortal(
        <div
          ref={calendarRef}
          role="dialog"
          aria-label="Choose a date"
          style={{ ...calendarPosition, maxHeight: 'calc(100vh - 16px)' }}
          className="z-[1000] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={viewYear <= minYear && viewMonth === 0}
              aria-label="Previous month"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
              <select
                aria-label="Month"
                value={viewMonth}
                onChange={(event) => setViewMonth(Number(event.target.value))}
                className="min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800"
              >
                {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
              </select>
              <select
                aria-label="Year"
                value={viewYear}
                onChange={(event) => setViewYear(Number(event.target.value))}
                className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-800"
              >
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              disabled={viewYear >= maxYear && viewMonth === 11}
              aria-label="Next month"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1 text-xs font-semibold text-slate-400">{day}</span>
            ))}
            {calendarDays.map((day, index) => day === null ? (
              <span key={`empty-${index}`} />
            ) : (
              <button
                key={day}
                type="button"
                disabled={isDateDisabled(day)}
                aria-label={`Select ${formatDate(viewYear, viewMonth, day)}`}
                aria-pressed={selectedDate?.getFullYear() === viewYear
                  && selectedDate?.getMonth() === viewMonth
                  && selectedDate?.getDate() === day}
                onClick={() => {
                  onChange(formatDate(viewYear, viewMonth, day));
                  setIsOpen(false);
                }}
                className="h-9 rounded-lg text-sm text-slate-700 transition-colors hover:bg-violet-50 hover:text-violet-800 aria-pressed:bg-violet-700 aria-pressed:font-bold aria-pressed:text-white disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                {day}
              </button>
            ))}
          </div>

          {!required && value && (
            <div className="mt-3 border-t border-slate-100 pt-2 text-right">
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Clear date
              </button>
            </div>
          )}
        </div>,
        wrapperRef.current?.ownerDocument.body ?? document.body
      )}
    </div>
  );
};

export default DatePicker;
