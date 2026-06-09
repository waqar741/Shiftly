"use client";

import React from "react";
import { Filter, Calendar, ChevronDown, Activity } from "lucide-react";

export default function AuditLogsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            System-wide activity tracking and historical records.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center gap-2 bg-slate-50/50">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          <select disabled className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-400 cursor-not-allowed shadow-sm focus:outline-none">
            <option>All Users</option>
          </select>
          <select disabled className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-400 cursor-not-allowed shadow-sm focus:outline-none">
            <option>All Modules</option>
          </select>
          <select disabled className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-400 cursor-not-allowed shadow-sm focus:outline-none">
            <option>All Actions</option>
          </select>
          <div className="h-4 w-px bg-slate-200 mx-1"></div>
          <button disabled className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-400 cursor-not-allowed flex items-center shadow-sm">
            <Calendar className="w-3 h-3 mr-1.5 opacity-50" /> Date Range <ChevronDown className="w-3 h-3 ml-1.5 opacity-40" />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
            <Activity className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No audit logs available</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
            System activity and historical records will appear here once tracking is enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
