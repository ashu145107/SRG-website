/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
};

export const Section: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      {children}
    </section>
  );
};

export const PageHeader: React.FC<{ title: string; subtitle?: string; children?: React.ReactNode }> = ({
  title,
  subtitle,
  children
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 pb-5 mb-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
};

export const Grid: React.FC<{ children: React.ReactNode; cols?: number; className?: string }> = ({
  children,
  cols = 3,
  className = ''
}) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  };

  const choice = colClasses[cols as 1 | 2 | 3 | 4] || 'grid-cols-1 md:grid-cols-3';

  return <div className={`grid gap-6 ${choice} ${className}`}>{children}</div>;
};

interface ResponsiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      {/* Side drawer panel */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 transform translate-x-0 animate-slide-in">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <span className="font-bold text-gray-800 text-base">{title || 'Menu'}</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <aside className={`w-64 bg-white border-r border-gray-100 h-full hidden lg:block text-left p-6 ${className}`}>
      {children}
    </aside>
  );
};

export const TopNavbar: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <header className={`w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs ${className}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">{children}</div>
    </header>
  );
};

export const Footer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return <footer className={`bg-blue-950 text-white mt-auto border-t border-blue-900/40 ${className}`}>{children}</footer>;
};
