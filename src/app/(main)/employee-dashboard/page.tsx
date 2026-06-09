import React from "react";
import { Banknote, Hourglass, CheckCircle2, Clock, Plus, Eye } from "lucide-react";
import Link from "next/link";

export default function EmployeeDashboardPage() {
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 mt-2 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Welcome, Waquar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's an overview of your shifts and earnings for this month.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/expenses" className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2 opacity-70" />
            Submit Expense
          </Link>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Submit Shift
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Month Earnings
            </p>
            <Banknote className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            ₹ 12,800
          </h3>
          <div className="flex items-center text-xs">
            <span className="text-slate-500">
              Projected based on approved shifts
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Approved Shifts
            </p>
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">14</h3>
          <div className="flex items-center text-xs text-slate-500">
            <span>This month</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Shifts
            </p>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            2
          </h3>
          <div className="flex items-center text-xs text-slate-500">
            <span>Awaiting branch manager</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Expenses
            </p>
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">
            ₹ 1,500
          </h3>
          <div className="flex items-center text-xs text-slate-500">
            <span>1 claim under review</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
          <Link href="/shifts" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View All</Link>
        </div>

        <div className="overflow-auto flex-1">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left whitespace-nowrap border-collapse">
            <thead className="sticky top-0 bg-white z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-3 text-slate-600">Jun 8, 2026</td>
                <td className="px-6 py-3 font-medium text-slate-900">Shift</td>
                <td className="px-6 py-3 text-slate-600">Full Day at Panvel</td>
                <td className="px-6 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-3 text-slate-600">Jun 7, 2026</td>
                <td className="px-6 py-3 font-medium text-slate-900">Expense</td>
                <td className="px-6 py-3 text-slate-600">Travel Claim (₹ 1,500)</td>
                <td className="px-6 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    Approved
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col p-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900 leading-tight">Shift</p>
                  <p className="text-xs text-slate-500">Jun 8, 2026</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                  Pending
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">Full Day at Panvel</p>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-slate-900 leading-tight">Expense</p>
                  <p className="text-xs text-slate-500">Jun 7, 2026</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                  Approved
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">Travel Claim (₹ 1,500)</p>
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button className="text-slate-400 hover:text-indigo-600 transition-colors p-1">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
