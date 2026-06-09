"use client";

import React, { useState, useEffect } from "react";
import { Download, FileText, ChevronDown, Calendar } from "lucide-react";
import { Toast } from "@/components/ui/components";

export default function ReportsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [formData, setFormData] = useState({
    branchId: '',
    employeeId: '',
    status: 'All'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, employeesRes] = await Promise.all([
          fetch('/api/v1/branches'),
          fetch('/api/v1/employees')
        ]);

        if (branchesRes.ok) {
          const { data } = await branchesRes.json();
          setBranches(data || []);
        }
        
        if (employeesRes.ok) {
          const { data } = await employeesRes.json();
          setEmployees(data?.items || []);
        }
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };
    
    fetchData();
  }, []);

  const handleGenerate = () => {
    setToastMessage("Report generation logic to be implemented");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleExport = () => {
    setToastMessage("Export functionality to be implemented");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and export various operational and financial reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 h-full flex-1">
        <div className="col-span-1 bg-white border border-slate-200 rounded-lg shadow-sm p-3 flex-shrink-0">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider px-2 hidden md:block">Report Types</p>
          <nav className="flex overflow-x-auto space-x-2 md:space-x-0 md:flex-col md:space-y-1 pb-1 md:pb-0">
            <button className="whitespace-nowrap md:w-full text-left px-3 py-2 bg-slate-100 text-slate-900 rounded-md text-sm font-medium transition-colors">
              Employee Report
            </button>
            <button className="whitespace-nowrap md:w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors">
              Branch Report
            </button>
            <button className="whitespace-nowrap md:w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors">
              Payroll Report
            </button>
            <button className="whitespace-nowrap md:w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors">
              Expense Report
            </button>
            <button className="whitespace-nowrap md:w-full text-left px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md text-sm font-medium transition-colors">
              Approval Report
            </button>
          </nav>
        </div>

        <div className="col-span-1 md:col-span-4 bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-medium text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-slate-400" /> Employee Report
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Detailed view of employee shifts, expenses, and earnings summary.
            </p>
          </div>

          <div className="p-5 flex-1 bg-slate-50/50">
            <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Range</label>
                <button className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center justify-between shadow-sm">
                  <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 opacity-50" /> Jun 1, 2026 - Jun 30, 2026</span>
                  <ChevronDown className="w-4 h-4 opacity-40" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Branch (Optional)</label>
                <select 
                  value={formData.branchId}
                  onChange={e => setFormData({...formData, branchId: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-slate-400 shadow-sm"
                >
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee (Optional)</label>
                <select 
                  value={formData.employeeId}
                  onChange={e => setFormData({...formData, employeeId: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-slate-400 shadow-sm"
                >
                  <option value="">All Employees</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-slate-400 shadow-sm"
                >
                  <option value="All">All</option>
                  <option value="Approved">Approved Only</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3">
                <button onClick={handleGenerate} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm transition-colors">
                  Generate Report
                </button>
                <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center transition-colors">
                  <Download className="w-4 h-4 mr-2 opacity-60" /> Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Toast 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
        message={toastMessage} 
      />
    </div>
  );
}
