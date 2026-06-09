"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, Download, SlidersHorizontal, Filter, ChevronDown, Calendar, Check, X, History, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Modal, ConfirmDialog, Pagination, SearchableSelect, useToast } from "@/components/ui/components";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function AdminShiftsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // details, history, audit
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [branches, setBranches] = useState<any[]>([]);
  const [shiftTypes, setShiftTypes] = useState<any[]>([]);

  // Filters State
  const branchFilter = searchParams.get("branch_id") || "";
  const statusFilter = searchParams.get("status") || "";
  const shiftTypeFilter = searchParams.get("shift_type_id") || "";

  // Update URL on filter changes
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleBranchFilter = (val: string) => router.push(pathname + "?" + createQueryString("branch_id", val));
  const handleStatusFilter = (val: string) => router.push(pathname + "?" + createQueryString("status", val));
  const handleShiftTypeFilter = (val: string) => router.push(pathname + "?" + createQueryString("shift_type_id", val));

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/shifts?${searchParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setShifts(data.data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch shifts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/branches").then(r => r.json()),
      fetch("/api/v1/shift-types").then(r => r.json())
    ]).then(([branchData, typeData]) => {
      if (branchData.success) setBranches(branchData.data);
      if (typeData.success) setShiftTypes(typeData.data);
    });
  }, []);

  const handleApprove = async (shift: any) => {
    try {
      const res = await fetch('/api/v1/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: shift.id, status: 'APPROVED' })
      });
      const data = await res.json();
      if (res.ok) {
        success("Shift approved successfully!");
        fetchShifts();
      } else {
        toastError(data.error?.message || "Failed to approve shift");
      }
    } catch (err) {
      toastError("An unexpected error occurred");
    }
  };

  const handleReject = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rejectRemarks) {
      toastError("Rejection remarks are required.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch('/api/v1/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedShift.id, status: 'REJECTED', remarks: rejectRemarks })
      });
      const data = await res.json();
      if (res.ok) {
        success("Shift rejected successfully!");
        setRejectOpen(false);
        fetchShifts();
      } else {
        toastError(data.error?.message || "Failed to reject shift");
      }
    } catch (err) {
      toastError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const branchOptions = branches.map(b => ({ label: b.name, value: String(b.id) }));
  const shiftTypeOptions = shiftTypes.map(st => ({ label: st.name, value: String(st.id) }));
  const statusOptions = [
    { label: "Pending", value: "PENDING" },
    { label: "Approved", value: "APPROVED" },
    { label: "Rejected", value: "REJECTED" }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Shift Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and approve employee shifts across all branches.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/shifts/bulk-entry" className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2 opacity-70" />
            Bulk Entry
          </Link>
          <Link href="/admin/shifts/bulk-create" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 shadow-sm flex items-center transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Bulk Wizard
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex-1 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 border-b border-slate-200 gap-3">
          <div className="relative w-full sm:w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input
               type="text"
               placeholder="Search employee or ID... (Coming soon)"
               className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-all"
             />
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm transition-colors">
              <Download className="w-3 h-3 mr-1.5 opacity-60" /> Export Excel
            </button>
            <button className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm transition-colors">
              <SlidersHorizontal className="w-3 h-3 mr-1.5 opacity-60" /> Columns
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-slate-100 flex flex-wrap gap-2 items-center justify-between bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
            <SearchableSelect
              options={[{label: "All Branches", value: ""}, ...branchOptions]}
              value={branchFilter}
              onChange={handleBranchFilter}
              placeholder="All Branches"
              className="w-40"
            />
            <SearchableSelect
              options={[{label: "All Statuses", value: ""}, ...statusOptions]}
              value={statusFilter}
              onChange={handleStatusFilter}
              placeholder="All Statuses"
              className="w-36"
            />
            <SearchableSelect
              options={[{label: "All Shift Types", value: ""}, ...shiftTypeOptions]}
              value={shiftTypeFilter}
              onChange={handleShiftTypeFilter}
              placeholder="All Shift Types"
              className="w-40"
            />
          </div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm">
              <Check className="w-3 h-3 mr-1.5 opacity-60" /> Bulk Approve
            </button>
            <button className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-700 flex items-center shadow-sm transition-colors">
              <X className="w-3 h-3 mr-1.5 opacity-60" /> Bulk Reject
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          <table className="w-full text-left whitespace-nowrap border-collapse min-w-[1200px]">
            <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200">
              <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 w-10 text-center"><input type="checkbox" className="rounded border-slate-300 accent-slate-800" /></th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">Shift Type</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Created By</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    Loading shifts...
                  </td>
                </tr>
              ) : shifts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                    No shifts found.
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3 text-center"><input type="checkbox" className="rounded border-slate-300 accent-slate-800" /></td>
                    <td className="px-4 py-3 text-slate-600">{new Date(shift.workDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{shift.user.fullName} ({shift.user.employeeCode})</td>
                    <td className="px-4 py-3 text-slate-600">{shift.branch.name}</td>
                    <td className="px-4 py-3 text-slate-600">{shift.shiftType.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600">₹ {shift.calculatedPay}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">₹ {shift.calculatedPay}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shift.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : shift.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">System</td>
                    <td className="px-4 py-3 text-right">
                        <button onClick={() => { setSelectedShift(shift); setDetailOpen(true); }} className="text-xs font-medium text-indigo-600 hover:text-indigo-500 mr-3">View</button>
                        {shift.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(shift)} className="text-xs font-medium text-emerald-600 hover:text-emerald-500 mr-3">Approve</button>
                            <button onClick={() => { setSelectedShift(shift); setRejectRemarks(""); setRejectOpen(true); }} className="text-xs font-medium text-red-600 hover:text-red-500">Reject</button>
                          </>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination total={shifts.length} page={1} pageSize={25} />
      </div>

      {/* Shift Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Shift Details" width="max-w-2xl">
        <div className="mb-4 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6">
            <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <FileText className="w-4 h-4 inline mr-2" />
              Details
            </button>
            <button onClick={() => setActiveTab('history')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Approval History
            </button>
            <button onClick={() => setActiveTab('audit')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'audit' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <History className="w-4 h-4 inline mr-2" />
              Audit Trail
            </button>
          </nav>
        </div>

        {activeTab === 'details' && selectedShift && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Employee</p>
                <p className="text-sm font-medium text-slate-900">{selectedShift.user.fullName} ({selectedShift.user.employeeCode})</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${selectedShift.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : selectedShift.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{selectedShift.status}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Date</p>
                <p className="text-sm text-slate-900">{new Date(selectedShift.workDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Shift Type</p>
                <p className="text-sm text-slate-900">{selectedShift.shiftType.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Branch</p>
                <p className="text-sm text-slate-900">{selectedShift.branch.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Calculated Amount</p>
                <p className="text-sm font-medium text-slate-900">₹ {selectedShift.calculatedPay}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Remarks</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 min-h-[40px]">{selectedShift.remarks || 'No remarks.'}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && selectedShift && (
          <div className="space-y-4">
             <div className="flex items-start space-x-3">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                 <Plus className="w-4 h-4 text-slate-500" />
               </div>
               <div>
                 <p className="text-sm font-medium text-slate-900">Submitted by {selectedShift.user.fullName}</p>
                 <p className="text-xs text-slate-500">{new Date(selectedShift.workDate).toLocaleString()}</p>
               </div>
             </div>
             {/* Approval trail would go here */}
          </div>
        )}

        {activeTab === 'audit' && selectedShift && (
          <div className="space-y-3">
             <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
               <p className="text-xs text-slate-500 mb-1">{new Date(selectedShift.workDate).toLocaleString()}</p>
               <p className="text-sm text-slate-900"><span className="font-medium">System</span> created shift with status <span className="font-medium bg-emerald-100 text-emerald-800 px-1 rounded">{selectedShift.status}</span></p>
             </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal 
        isOpen={rejectOpen} 
        onClose={() => setRejectOpen(false)} 
        title="Reject Shift" 
        primaryAction={handleReject} 
        destructive 
        primaryLabel={submitting ? "Rejecting..." : "Reject"}
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-sm text-slate-600">Please provide a reason for rejecting this shift. This will be visible to the employee.</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Rejection Remarks <span className="text-red-500">*</span></label>
            <textarea 
              required 
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={4} 
              placeholder="e.g. Times do not match system logs..." 
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-slate-400 resize-none"
            ></textarea>
          </div>
          <button type="submit" className="hidden">Submit</button>
        </form>
      </Modal>
    </div>
  );
}
