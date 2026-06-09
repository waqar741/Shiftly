"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { X, AlertTriangle, Inbox, Check } from "lucide-react";

/* ─── Modal ─── */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  primaryLabel = "Save",
  secondaryLabel = "Cancel",
  width = "max-w-md",
  destructive = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
  width?: string;
  destructive?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${width} border border-slate-200 overflow-hidden`} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {primaryAction && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
              {secondaryLabel}
            </button>
            <button onClick={primaryAction} className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${destructive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              {primaryLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Toast ─── */
export function Toast({ message, type = "success", isVisible, onClose }: {
  message: string;
  type?: "success" | "error" | "warning";
  isVisible: boolean;
  onClose: () => void;
}) {
  if (!isVisible) return null;

  const colors = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center p-4 rounded-lg shadow-lg border bg-white border-slate-200 text-slate-800">
      <div className={`w-2 h-2 rounded-full mr-3 ${colors[type]}`}></div>
      <p className="text-sm font-medium mr-6">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Confirm Dialog ─── */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  destructive = true,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${destructive ? 'bg-red-100' : 'bg-amber-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${destructive ? 'text-red-600' : 'text-amber-600'}`} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className={`px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors ${destructive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Loading Skeleton ─── */
export function LoadingSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, 1fr)` }}>
        {Array.from({ length: Math.min(cols, 4) }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="h-3 bg-slate-200 rounded w-24 mb-3"></div>
            <div className="h-6 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-2 bg-slate-100 rounded w-32"></div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="h-4 bg-slate-200 rounded w-48 mb-6"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 mb-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-3 bg-slate-100 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Empty State ─── */
export function EmptyState({
  title = "No data found",
  message = "There are no records to display.",
  actionLabel,
  onAction,
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <Inbox className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-xs">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ─── Pagination ─── */
export function Pagination({
  total,
  page = 1,
  pageSize = 25,
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
      <div className="flex items-center space-x-3">
        <span>Showing {from} to {to} of {total}</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white focus:outline-none"
        >
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>
      <div className="flex space-x-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
          className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
          <button
            key={i}
            onClick={() => onPageChange?.(i + 1)}
            className={`px-3 py-1 border border-slate-200 rounded-md ${page === i + 1 ? 'bg-slate-900 text-white border-slate-900' : 'hover:bg-slate-50'}`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
          className="px-3 py-1 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/* ─── Custom Select ─── */
export function Select({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50 shadow-sm flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-slate-300"
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3 h-3 ml-2 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                value === option.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Toast Context & Provider ─── */
type ToastType = "success" | "error" | "warning";
interface ToastData {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success: (msg) => addToast(msg, "success"),
        error: (msg) => addToast(msg, "error"),
      }}
    >
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-center p-4 rounded-lg shadow-lg border bg-white border-slate-200 text-slate-800 animate-in slide-in-from-bottom-5 duration-300">
            <div className={`w-2 h-2 rounded-full mr-3 ${t.type === 'success' ? 'bg-emerald-500' : t.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
            <p className="text-sm font-medium mr-6">{t.message}</p>
            <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a dummy object if used outside provider (to prevent immediate crashes if provider isn't wrapped yet)
    return {
      toast: console.log,
      success: console.log,
      error: console.error,
    };
  }
  return context;
}

/* ─── Searchable Select ─── */
export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setIsOpen(!isOpen); setSearch(""); }}
        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50 shadow-sm flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? "text-slate-900" : "text-slate-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-3 h-3 ml-2 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 flex flex-col">
          <div className="p-2 border-b border-slate-100">
            <input 
              type="text" 
              autoFocus 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search..." 
              className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:border-slate-400"
            />
          </div>
          <div className="overflow-auto flex-1 py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500 text-center">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    value === option.value
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Multi Select ─── */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  disabled = false,
}: {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  const selectedLabels = options.filter(o => value.includes(o.value)).map(o => o.label);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 hover:bg-slate-50 shadow-sm flex items-center justify-between transition-colors focus:outline-none focus:ring-1 focus:ring-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex flex-wrap gap-1 items-center">
          {selectedLabels.length > 0 ? (
            <span className="text-slate-900 line-clamp-1">{selectedLabels.join(", ")}</span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <svg
          className={`w-3 h-3 ml-2 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto py-1">
          {options.map((option) => {
            const isSelected = value.includes(option.value);
            return (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <span>{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
