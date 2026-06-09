"use client";

import React, { useEffect, useState } from "react";
import {
  Banknote,
  TrendingUp,
  Hourglass,
  AlertTriangle,
  Receipt,
  Users,
  CheckCircle2,
  Download,
  SlidersHorizontal,
  Plus,
  Filter,
  ChevronDown,
  Calendar,
  Check,
  X,
  Building,
} from "lucide-react";
import { useRole } from "@/components/layout/RoleContext";
import { Toast } from "@/components/ui/components";

export default function DashboardPage() {
  const { role } = useRole();
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/dashboard/stats');
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const { data } = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [role]);

  if (loading) {
    return <div className="flex h-full items-center justify-center p-8 text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex h-full items-center justify-center p-8 text-red-500">Error: {error}</div>;
  }

  if (role === "Employee" || stats?.isEmployee) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">Here is a summary of your upcoming shifts and pending expenses.</p>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Upcoming Shifts</p>
              <Hourglass className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">{stats?.upcomingShiftsCount || 0}</h3>
            <span className="text-xs text-slate-500">
              {stats?.nextShift ? `Next shift on ${new Date(stats.nextShift).toLocaleDateString()}` : 'No upcoming shifts scheduled'}
            </span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Expenses</p>
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">₹ {stats?.pendingExpensesAmount || 0}</h3>
            <span className="text-xs text-slate-500">{stats?.pendingExpensesCount || 0} claims under review</span>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Payout</p>
              <Banknote className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">₹ {stats?.lastPayoutAmount || 0}</h3>
            <span className="text-xs text-slate-500 text-emerald-600 font-medium">{stats?.lastPayoutMonth || 'N/A'}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Payroll</p>
            <Banknote className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">₹ {stats?.monthlyPayroll || 0}</h3>
          <div className="flex items-center text-xs">
            <TrendingUp className="w-3 h-3 text-emerald-600 mr-1" />
            <span className="text-slate-500"><span className="text-emerald-600 font-medium">This month</span></span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Shifts</p>
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">{stats?.pendingShifts || 0}</h3>
          <div className="flex flex-col text-xs space-y-0.5 text-slate-500">
            <span>Awaiting manager approval</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Expenses</p>
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">₹ {stats?.pendingExpenses?.amount || 0}</h3>
          <div className="flex flex-col text-xs space-y-0.5 text-slate-500">
            <span>{stats?.pendingExpenses?.count || 0} claims pending</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Employees</p>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">{stats?.activeEmployees || 0}</h3>
          <div className="flex flex-col text-xs space-y-0.5 text-slate-500">
            <span>Across {stats?.branches?.active || 0} branches</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Branches</p>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-1">{stats?.branches?.total || 0}</h3>
          <div className="flex flex-col text-xs space-y-0.5 text-slate-500">
            <span>{stats?.branches?.active || 0} active, {stats?.branches?.inactive || 0} inactive</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center">
            <h2 className="font-semibold text-slate-900 mr-3">Recent Shifts</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => { setShowToast(true); setTimeout(() => setShowToast(false), 3000); }} className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm transition-colors">
              <Download className="w-3 h-3 mr-1.5 opacity-60" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Shift Type</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {stats?.recentShifts?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No recent shifts found
                  </td>
                </tr>
              ) : (
                stats?.recentShifts?.map((shift: any) => (
                  <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{shift.user?.fullName}</p>
                      <p className="text-xs text-slate-500">{shift.user?.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{shift.branch?.name}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(shift.workDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{shift.shiftType?.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        shift.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" :
                        shift.status === "REJECTED" ? "bg-red-100 text-red-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      ₹ {shift.calculatedPay}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Toast isVisible={showToast} onClose={() => setShowToast(false)} message="Export started successfully." />
    </>
  );
}
