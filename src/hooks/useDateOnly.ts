import { useCallback } from 'react';

const formatDateOnly = (value: unknown): string => {
  if (value === undefined || value === null || value === '') return '';

  const raw = String(value).trim();
  const datePrefix = raw.match(/^(\d{4}-\d{2}-\d{2})(?:$|T|\s)/);
  if (datePrefix) {
    const date = new Date(`${datePrefix[1]}T00:00:00`);
    return Number.isNaN(date.getTime()) ? raw : datePrefix[1];
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useDateOnly = () => useCallback(formatDateOnly, []);
