/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Mail, AlertTriangle } from 'lucide-react';

interface DataTableProps<T> {
  columns: {
    key: keyof T | string;
    header: string;
    render?: (row: T) => React.ReactNode;
  }[];
  data: T[];
  onRowClick?: (row: T) => void;
  // Custom card render when we transform tables to card layout on mobile view!
  mobileCardRender?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  mobileCardRender
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      {/* Mobile Card Layout (Visible on Small Screens) */}
      <div className="block md:hidden space-y-4">
        {data.length === 0 ? (
          <EmptyState title="माहिती उपलब्ध नाही" desc="No data records currently found here." />
        ) : (
          data.map((row, idx) => (
            <div
              key={row.id || idx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`p-4 bg-white rounded-xl border border-gray-100 shadow-sm ${
                onRowClick ? 'cursor-pointer hover:border-orange-200' : ''
              }`}
            >
              {mobileCardRender ? (
                mobileCardRender(row)
              ) : (
                <div className="space-y-2 text-left">
                  {columns.map((col, colIdx) => (
                    <div key={colIdx} className="text-sm">
                      <span className="font-bold text-gray-500 mr-2">{col.header}:</span>
                      <span className="text-gray-900">
                        {col.render ? col.render(row) : String(row[col.key as keyof T] || '')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Responsive Table Layout (Visible on MD and larger) */}
      <div className="hidden md:block overflow-x-auto border border-gray-100 rounded-xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <EmptyState title="माहिती उपलब्ध नाही" desc="No data records currently found here." />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-gray-50/50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4.5 text-sm text-gray-700">
                      {col.render ? col.render(row) : String(row[col.key as keyof T] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reuse DataTable for Server Side Table behavior as a wrapper
export function ServerSideTable<T extends { id: string | number }>(props: DataTableProps<T> & { loading?: boolean }) {
  if (props.loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
        <span className="text-xs text-gray-500">माहिती लोड होत आहे...</span>
      </div>
    );
  }
  return <DataTable {...props} />;
}

interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, className = '', children }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md/5 text-left ${className}`}>
      {title && <h3 className="text-base font-semibold text-blue-950 mb-4 border-b border-gray-50 pb-2.5">{title}</h3>}
      {children}
    </div>
  );
};

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, icon, trend, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between text-left transition-all hover:translate-y-[-2px] ${className}`}>
      <div className="space-y-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{title}</span>
        <span className="text-2xl font-bold text-gray-900 block">{value}</span>
        {trend && <span className="text-xs text-emerald-600 font-medium block">{trend}</span>}
      </div>
      {icon && <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">{icon}</div>}
    </div>
  );
};

export const EmptyState: React.FC<{ title: string; desc: string }> = ({ title, desc }) => {
  return (
    <div className="py-12 px-6 text-center flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
      <div className="p-4 bg-gray-100 text-gray-400 rounded-full mb-3">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h4 className="text-sm font-bold text-gray-700">{title}</h4>
      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">{desc}</p>
    </div>
  );
};

export const Badge: React.FC<{ type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'; children: React.ReactNode }> = ({
  type = 'primary',
  children
}) => {
  const stylesByTheme = {
    primary: 'bg-orange-50 text-orange-700 border-orange-100',
    secondary: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold border rounded-lg inline-flex items-center gap-1.5 ${stylesByTheme[type]}`}>
      {children}
    </span>
  );
};

export const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
      {children}
    </span>
  );
};

interface TimelineItemProps {
  title: string;
  time: string;
  desc?: string;
  isLatest?: boolean;
}

export const Timeline: React.FC<{ items: TimelineItemProps[] }> = ({ items }) => {
  return (
    <div className="space-y-6 relative before:absolute before:inset-y-1 before:left-3 before:w-0.5 before:bg-gray-100 text-left">
      {items.map((item, idx) => (
        <div key={idx} className="relative pl-8 flex gap-4">
          <div className={`absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white -translate-x-1/2 z-10 ${
            idx === 0 ? 'bg-orange-600 ring-4 ring-orange-100' : 'bg-gray-300'
          }`} />
          <div className="flex-1 space-y-1 bg-white rounded-lg">
            <span className="text-sm font-bold text-gray-900 block">{item.title}</span>
            {item.desc && <p className="text-xs text-gray-500 leading-relaxed block">{item.desc}</p>}
            <span className="text-[10px] text-gray-400 font-mono font-medium block">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
