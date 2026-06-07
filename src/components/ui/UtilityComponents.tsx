/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import { Globe, ChevronRight } from 'lucide-react';
import { HandlerPermissions } from '../../types';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'mr';

  const toggleLanguage = (lang: 'mr' | 'en') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('app_lang', lang);
  };

  return (
    <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
      <Globe className="w-4 h-4 text-gray-400 ml-1" />
      <button
        onClick={() => toggleLanguage('mr')}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          currentLang === 'mr' ? 'bg-orange-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200/50'
        }`}
      >
        मराठी
      </button>
      <button
        onClick={() => toggleLanguage('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
          currentLang === 'en' ? 'bg-orange-600 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-200/50'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export const Pagination: React.FC<{
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}> = ({ current, total, onPageChange }) => {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1.5 py-4">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8.5 h-8.5 rounded-xl text-xs font-bold transition-all border ${
            current === p
              ? 'bg-orange-600 text-white border-orange-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export const Breadcrumb: React.FC<{
  paths: { label: string; to?: string }[];
}> = ({ paths }) => {
  return (
    <nav className="flex items-center gap-1 text-xs text-gray-500 font-medium mb-4 text-left">
      {paths.map((p, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
          {p.to ? (
            <Link to={p.to} className="hover:text-orange-600 transition-colors">
              {p.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-semibold">{p.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  permission: keyof HandlerPermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({ permission, children, fallback = null }) => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return <>{fallback}</>;

  // Super Admin can do EVERYTHING
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    return <>{children}</>;
  }

  if (user.role === 'HANDLER') {
    const hasPermission = user.handlerPermissions?.[permission];
    if (hasPermission) {
      return <>{children}</>;
    }
  }

  return <>{fallback}</>;
};
