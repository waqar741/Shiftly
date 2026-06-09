"use client";

import React, { useState, useEffect } from "react";
import { Play, Download, Lock, Search } from "lucide-react";
import { Modal, useToast } from "@/components/ui/components";

export default function PayrollPage() {
  const [payrollBatches, setPayrollBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/payroll');
      if (res.ok) {
        const { data } = await res.json();
        setPayrollBatches(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch payroll", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGenerate = async () => {
    try {
      const res = await fetch('/api/v1/payroll/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: parseInt(formData.month.toString()),
          year: parseInt(formData.year.toString())
        })
      });

      const data = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        success("Payroll generated successfully!");
        fetchPayroll();
      } else {
        toastError(data.error?.message || "Failed to generate payroll");
      }
    } catch (error) {
      toastError("An error occurred");
    }
  };

  const handleLock = async (id: number) => {
    try {
      // In a real app, you'd probably have an endpoint to explicitly lock
      toastError("Locking functionality to be implemented");
    } catch (error) {
      console.error(error);
    }
  };

  const viewDetails = (batch: any) => {
    setSelectedBatch(batch);
    setDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Payroll Generation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculate monthly payouts for all employees based on approved shifts and expenses.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
          <Play className="w-4 h-4 mr-2" />
          Generate Payroll
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left whitespace-nowrap border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Month</th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3 text-right">Employees</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3">Generated Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading payroll batches...
                  </td>
                </tr>
              ) : payrollBatches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No payroll batches found.
                  </td>
                </tr>
              ) : (
                payrollBatches.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-3 font-medium text-slate-900">
                      {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' })}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{payroll.year}</td>
                    <td className="px-6 py-3 text-right text-slate-600">{payroll.items?.length || 0}</td>
                    <td className="px-6 py-3 text-right font-medium text-slate-900">₹ {payroll.totalAmount}</td>
                    <td className="px-6 py-3 text-center">
                      {payroll.status === "LOCKED" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-white">
                          <Lock className="w-3 h-3 mr-1" /> Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-slate-600">{new Date(payroll.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => viewDetails(payroll)} className="text-xs font-medium text-indigo-600 hover:text-indigo-500 mr-3">View</button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      {payroll.status !== "LOCKED" && (
                        <button onClick={() => handleLock(payroll.id)} className="p-1.5 text-slate-400 hover:text-amber-600 transition-colors ml-1">
                          <Lock className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="md:hidden flex flex-col p-4 space-y-4">
            {loading ? (
              <div className="text-center text-slate-500 py-8">Loading payroll batches...</div>
            ) : payrollBatches.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No payroll batches found.</div>
            ) : (
              payrollBatches.map((payroll) => (
                <div key={payroll.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-900 leading-tight">
                        {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long' })} {payroll.year}
                      </p>
                      <p className="text-xs text-slate-500">{payroll.items?.length || 0} Employees</p>
                    </div>
                    {payroll.status === "LOCKED" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-white">
                        <Lock className="w-3 h-3 mr-1" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                        Draft
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-md mb-4 border border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-500 uppercase">Total Amount</span>
                    <span className="font-medium text-slate-900">£ {payroll.totalAmount}</span>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button onClick={() => viewDetails(payroll)} className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors">
                      View
                    </button>
                    {payroll.status !== "LOCKED" && (
                      <button onClick={() => handleLock(payroll.id)} className="px-3 py-1.5 bg-white border border-slate-200 text-amber-600 hover:bg-slate-50 rounded-md text-xs font-medium transition-colors flex items-center">
                        <Lock className="w-3.5 h-3.5 mr-1" /> Lock
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Generate Payroll"
        primaryAction={handleGenerate}
        primaryLabel="Generate"
      >
        <form className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <p className="text-xs text-amber-800 font-medium">Warning: Generating a new payroll draft will fetch latest approved shifts and expenses for this period.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Month</label>
              <select 
                value={formData.month}
                onChange={e => setFormData({...formData, month: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Year</label>
              <select 
                value={formData.year}
                onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:border-slate-400"
              >
                {[formData.year - 1, formData.year, formData.year + 1].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Payroll Detail View Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title={`Payroll Details — ${selectedBatch ? new Date(selectedBatch.year, selectedBatch.month - 1).toLocaleString('default', { month: 'long' }) + ' ' + selectedBatch.year : ''}`} width="max-w-4xl">
        {selectedBatch && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-slate-100 space-y-4 md:space-y-0">
              <div className="flex space-x-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Total Employees</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{selectedBatch.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Grand Total</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">₹ {selectedBatch.totalAmount}</p>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search employee..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all" />
              </div>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-md max-h-[50vh]">
              <table className="w-full text-left whitespace-nowrap border-collapse">
                <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
                  <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-2">Employee</th>
                    <th className="px-4 py-2 text-right">Total Payout</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {selectedBatch.items?.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500">No items found</td>
                    </tr>
                  ) : (
                    selectedBatch.items?.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2">
                          <p className="font-medium text-slate-900">{item.user?.fullName}</p>
                          <p className="text-xs text-slate-500">{item.user?.employeeCode}</p>
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-slate-900">₹ {item.totalPay}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Modal>

    </div>
  );
}
