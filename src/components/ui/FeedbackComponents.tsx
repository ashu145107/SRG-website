/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

interface AlertProps {
  type?: 'success' | 'info' | 'warning' | 'danger';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', title, message, onClose }) => {
  const stylesMap = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800'
  };

  const IconMap = {
    success: <CheckCircle className="w-5 h-5 text-emerald-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
    danger: <XCircle className="w-5 h-5 text-red-600" />
  };

  return (
    <div className={`p-4 border rounded-xl flex items-start gap-3 text-left transition-all relative ${stylesMap[type]}`}>
      <div className="mt-0.5">{IconMap[type]}</div>
      <div className="flex-1">
        {title && <span className="block font-bold text-sm mb-0.5">{title}</span>}
        <span className="block text-xs leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-lg text-current">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, durationMs = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [onClose, durationMs]);

  const styles = {
    success: 'bg-gray-900 border-emerald-500/30 text-white',
    info: 'bg-gray-900 border-blue-500/30 text-white',
    warning: 'bg-gray-900 border-amber-500/30 text-white',
    error: 'bg-gray-900 border-rose-500/30 text-white'
  };

  const Icons = {
    success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
    info: <Info className="w-4 h-4 text-blue-400" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
    error: <XCircle className="w-4 h-4 text-rose-400" />
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 p-4 border rounded-xl flex items-center gap-3 shadow-lg max-w-sm animate-slide-in ${styles[type]}`}>
      {Icons[type]}
      <span className="text-xs font-medium flex-1 text-left">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white rounded-lg">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col z-10 p-6 animate-fade-in text-left">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h3 className="text-lg font-bold text-blue-950">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto max-h-[70vh]">{children}</div>
      </div>
    </div>
  );
};

export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 text-left animate-fade-in">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold hover:bg-gray-100 rounded-xl text-gray-600 transition-colors">
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-all"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Loader: React.FC<{ fullScreen?: boolean }> = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 border-l-transparent"></div>
      <span className="text-xs font-semibold text-gray-500">श्री स्वामी समर्थ...</span>
    </div>
  );

  if (fullScreen) {
    return <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">{content}</div>;
  }
  return <div className="py-8 flex items-center justify-center">{content}</div>;
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
};
