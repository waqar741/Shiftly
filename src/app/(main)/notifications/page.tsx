import React from "react";
import { CheckCircle2, Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay updated on shift approvals, expenses, and payroll.
          </p>
        </div>
        <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-400 cursor-not-allowed shadow-sm flex items-center transition-colors">
          <CheckCircle2 className="w-4 h-4 mr-2 opacity-70" />
          Mark All as Read
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
          <Bell className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No notifications yet</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
          When there's an update about your shifts, expenses, or payroll, it will appear here.
        </p>
      </div>
    </div>
  );
}
